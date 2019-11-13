class Position {
    /**
     *
     * @param {number} line
     * @param {number} line_offset
     * @param {number} offset
     */
    constructor(line, line_offset, offset) {
        this.line = line
        this.lineOffset = line_offset
        this.offset = offset
    }
}

class MutablePosition extends Position {
    constructor() {
        super(0, 0, 0)
    }
    get immutableCopy() {
        return new Position(
            this.line,
            this.lineOffset,
            this.offset
        )
    }
    /**
     *
     * @param {string} content
     */
    consume(content) {
        this.offset += content.length
        const adds_lines = content.length - content.replace(/\n/g, "").length
        if(adds_lines) {
            this.line += adds_lines
            this.lineOffset = content.replace(/.*\n/g, "").length
        } else {
            this.lineOffset += content.length
        }
    }
}

export class Token {
    /**
     *
     * @param {string} type
     * @param {string} content
     * @param {?Position} position
     */
    constructor(type, content, position = null) {
        this.content = content
        this.position = position
        this.type = type
    }
}
export class Lex {
    /**
     *
     * @param {string} contents
     */
    constructor(contents) {
        this.contents = contents
    }
    get tokens() {
        if(!this._tokens) {
            let contents = this.contents
            const possible = {
                html: [
                    [/^.*?<[?]php\b/s, "php", "none"],
                ],
                none: [
                    [/^\s+/, "space"],
                    [/^\/[*][*]/, "comment", "comment"],
                    [/^\\?[_a-zA-Z][\w\\]*/, "bareword"],
                    [/^[(]/, "openBracket"],
                    [/^[)]/, "closeBracket"],
                    [/^[[]/, "openSquare"],
                    [/^[\]]/, "closeSquare"],
                    [/^[{]/, "openCurly"],
                    [/^[}]/, "closeCurly"],
                    [/^\d+([.]\w+)?/, "number"],
                    [/^[.]/, "dot"],
                    [/^->/, "arrow"],
                    [/^=>/, "fatArrow"],
                    [/^,/, "comma"],
                    [/^[$][a-zA-Z]\w*/, "varname"],
                    [/^"/, "quoteDouble", "stringDouble"],
                    [/^'/, "quoteSingle", "stringSingle"],
                    [/^\/\//, "inlineComment", "inlineComment"],
                    [/^[*\/+-]/, "mathsOperator"],
                    [/^(?:&&|[|][|])/, "booleanOperator"],
                    [/^[&|^]/, "bitOperator"],
                    [/^;/, "semicolon"],
                    [/^::/, "doubleColon"],
                    [/^:/, "colon"],
                    [/^===/, "equals3"],
                    [/^==/, "equals2"],
                    [/^=/, "equals"],
                    [/^@/, "at"],
                    [/^>=/, "greaterEquals"],
                    [/^>/, "greaterThan"],
                    [/^<=/, "lessEquals"],
                    [/^</, "lessThan"],
                    [/^!==/, "notEquals3"],
                    [/^!=/, "notEquals2"],
                    [/^!/, "not"],
                    [/^[?]>/, "endOfPhp", "-pop"],
                    [/^[?]/, "questionMark"],
                ],
                comment: [
                    [/^\\/, "escape", "escape"],
                    [/^[^\\*]+/, "string"],
                    [/^[*]\//, "commentEnd", "-pop"],
                    [/^[*]/, "string"], // Last for a reason
                ],
                escape: [
                    [/^./, "escapedChar", "-pop"],
                ],
                inlineComment: [
                    [/^[^\n]/, "string"],
                    [/^\n/, "lineEnd", "-pop"],
                ],
                stringDouble: [
                    [/^\\/, "escape", "escape"],
                    [/^"/, "quoteDouble", "-pop"],
                    [/^[^"\\]*/, "string"],
                ],
                stringSingle: [
                    [/^\\/, "escape", "escape"],
                    [/^[^'\\]+/, "string"],
                    [/^'/, "quoteSingle", "-pop"],
                ],
            }
            let mode = "html"
            const modes = []
            /**
             * @type {Token[]}
             */
            const chunks = []
            let last_contents = contents
            const position = new MutablePosition()
            while(contents) {
                let md
                for(const [r, n, new_mode] of possible[mode]) {
                    if(md = contents.match(r)) {
                        contents = contents.substring(md[0].length)
                        chunks.push(new Token(n, md[0], position.immutableCopy))
                        position.consume(md[0])
                        if(new_mode) {
                            if(new_mode == "-pop") {
                                mode = modes.pop()
                            } else {
                                modes.push(mode)
                                mode = new_mode
                            }
                        }
                        break
                    }
                }
                if(last_contents == contents) {
                    throw new Error(`Lexer loop in mode ${mode} at ${JSON.stringify(last_contents.substring(0, 15) + "...")}`)
                }
                if(contents == "") {
                    break
                }
                last_contents = contents
            }
            this._tokens = chunks
        }
        return this._tokens
    }
}