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
                    [/^.*/s, "other"],
                ],
                none: [
                    [/^<<<'(\w+)'/, "nowdoc", "nowdoc", "\n$1"],
                    [/^<<<(\w+)/, "heredoc", "heredoc", "\n$1"],
                    [/^\s+/, "space"],
                    [/^\/[*][*]/, "comment", "comment"],
                    [/^\/[*]/, "comment", "comment"],
                    [/^\\?[_a-zA-Z][\w\\]*/, "bareword"],
                    [/^[(]/, "openBracket"],
                    [/^[)]/, "closeBracket"],
                    [/^[[]/, "openSquare"],
                    [/^[\]]/, "closeSquare"],
                    [/^[{]/, "openCurly"],
                    [/^[}]/, "closeCurly"],
                    [/^\d+([.]\w+)?/, "number"],
                    [/^[.]=/, "inPlaceConcatenation"],
                    [/^[.]/, "dot"],
                    [/^->/, "arrow"],
                    [/^=>/, "fatArrow"],
                    [/^,/, "comma"],
                    [/^[$][a-zA-Z]\w*/, "varname"],
                    [/^"/, "quoteDouble", "stringDouble"],
                    [/^'/, "quoteSingle", "stringSingle"],
                    [/^\/\//, "inlineComment", "inlineComment"],
                    [/^[+][+]/, "plusplus"],
                    [/^--/, "minusminus"],
                    [/^[*\/+-]=/, "inPlaceMathsOperator"],
                    [/^[+-]/, "unaryMathsOperator"],
                    [/^[*\/]/, "mathsOperator"],
                    [/^(?:&&|[|][|])/, "booleanOperator"],
                    [/^&/, "ampersand"],
                    [/^[|^]/, "bitOperator"],
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
                heredoc: [
                    [null, "endheredoc", "-pop"],
                    [/^\\/, "escape", "escape"],
                    [/^[^'\\]+/, "string"],
                ],
                inlineComment: [
                    [/^[^\n]+/, "string"],
                    [/^\n/, "lineEnd", "-pop"],
                ],
                nowdoc: [
                    [null, "endnowdoc", "-pop"],
                    [/^\\/, "escape", "escape"],
                    [/^[^'\\]+/, "string"],
                ],
                stringDouble: [
                    [/^\\/, "escape", "escape"],
                    [/^"/, "quoteDouble", "-pop"],
                    [/^[^"\\]+/, "string"],
                ],
                stringSingle: [
                    [/^\\/, "escape", "escape"],
                    [/^[^'\\]+/, "string"],
                    [/^'/, "quoteSingle", "-pop"],
                ],
            }
            let mode = "html"
            let end_marker = null
            const modes = []
            const end_markers = []
            /**
             * @type {Token[]}
             */
            const chunks = []
            let last_contents = contents
            const position = new MutablePosition()
            while(contents) {
                let md
                for(const [r, n, new_mode, end_marker_expr] of possible[mode]) {
                    if(!r && end_marker && contents.substring(0, end_marker.length) == end_marker) {
                        contents = contents.substring(end_marker.length)
                        chunks.push(new Token(n, end_marker, position.immutableCopy))
                        position.consume(end_marker)
                        mode = modes.pop()
                        end_marker = end_markers.pop()
                        break
                    } else if(r && (md = contents.match(r))) {
                        contents = contents.substring(md[0].length)
                        chunks.push(new Token(n, md[0], position.immutableCopy))
                        position.consume(md[0])
                        if(new_mode) {
                            if(new_mode == "-pop") {
                                mode = modes.pop()
                                end_marker = end_markers.pop()
                            } else {
                                modes.push(mode)
                                mode = new_mode
                                end_markers.push(end_marker)
                                end_marker = end_marker_expr ? md[0].replace(r, end_marker_expr) : null
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