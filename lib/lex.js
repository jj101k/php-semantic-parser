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
class TokenMatch {
    /**
     *
     * @param {string} s
     * @returns {?string}
     */
    matches(s) {
        throw new Error("Not implemented")
    }
    /**
     *
     * @param {string} t
     * @param {string} end_marker_expr
     * @returns {string}
     */
    replace(t, end_marker_expr) {
        throw new Error("Not implemented")
    }
}
class RegExpTokenMatch extends TokenMatch {
    /**
     *
     * @param {RegExp} regexp
     */
    constructor(regexp) {
        super()
        this.regexp = regexp
    }
    matches(s) {
        const md = s.match(this.regexp)
        return md ? md[0] : null
    }
    replace(t, end_marker_expr) {
        return t.replace(this.regexp, end_marker_expr)
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
                    [new RegExpTokenMatch(/^.*?<[?]php\b/s), "php", "none"],
                    [new RegExpTokenMatch(/^.*/s), "other"],
                ],
                none: [
                    [new RegExpTokenMatch(/^<<<'(\w+)'/), "nowdoc", "nowdoc", "\n$1"],
                    [new RegExpTokenMatch(/^<<<(\w+)/), "heredoc", "heredoc", "\n$1"],
                    [new RegExpTokenMatch(/^\s+/), "space"],
                    [new RegExpTokenMatch(/^\/[*][*]/), "comment", "comment"],
                    [new RegExpTokenMatch(/^\/[*]/), "comment", "comment"],
                    [new RegExpTokenMatch(/^\\?[_a-zA-Z][\w\\]*/), "bareword"],
                    [new RegExpTokenMatch(/^[(]/), "openBracket"],
                    [new RegExpTokenMatch(/^[)]/), "closeBracket"],
                    [new RegExpTokenMatch(/^[[]/), "openSquare"],
                    [new RegExpTokenMatch(/^[\]]/), "closeSquare"],
                    [new RegExpTokenMatch(/^[{]/), "openCurly"],
                    [new RegExpTokenMatch(/^[}]/), "closeCurly"],
                    [new RegExpTokenMatch(/^\d+([.]\w+)?/), "number"],
                    [new RegExpTokenMatch(/^[.]=/), "inPlaceConcatenation"],
                    [new RegExpTokenMatch(/^[.]/), "dot"],
                    [new RegExpTokenMatch(/^->/), "arrow"],
                    [new RegExpTokenMatch(/^=>/), "fatArrow"],
                    [new RegExpTokenMatch(/^,/), "comma"],
                    [new RegExpTokenMatch(/^[$][a-zA-Z]\w*/), "varname"],
                    [new RegExpTokenMatch(/^"/), "quoteDouble", "stringDouble"],
                    [new RegExpTokenMatch(/^'/), "quoteSingle", "stringSingle"],
                    [new RegExpTokenMatch(/^\/\//), "inlineComment", "inlineComment"],
                    [new RegExpTokenMatch(/^[+][+]/), "plusplus"],
                    [new RegExpTokenMatch(/^--/), "minusminus"],
                    [new RegExpTokenMatch(/^[*\/+-]=/), "inPlaceMathsOperator"],
                    [new RegExpTokenMatch(/^[+-]/), "unaryMathsOperator"],
                    [new RegExpTokenMatch(/^[*\/]/), "mathsOperator"],
                    [new RegExpTokenMatch(/^(?:&&|[|][|])/), "booleanOperator"],
                    [new RegExpTokenMatch(/^&/), "ampersand"],
                    [new RegExpTokenMatch(/^[|^]/), "bitOperator"],
                    [new RegExpTokenMatch(/^;/), "semicolon"],
                    [new RegExpTokenMatch(/^::/), "doubleColon"],
                    [new RegExpTokenMatch(/^:/), "colon"],
                    [new RegExpTokenMatch(/^===/), "equals3"],
                    [new RegExpTokenMatch(/^==/), "equals2"],
                    [new RegExpTokenMatch(/^=/), "equals"],
                    [new RegExpTokenMatch(/^@/), "at"],
                    [new RegExpTokenMatch(/^>=/), "greaterEquals"],
                    [new RegExpTokenMatch(/^>/), "greaterThan"],
                    [new RegExpTokenMatch(/^<=/), "lessEquals"],
                    [new RegExpTokenMatch(/^</), "lessThan"],
                    [new RegExpTokenMatch(/^!==/), "notEquals3"],
                    [new RegExpTokenMatch(/^!=/), "notEquals2"],
                    [new RegExpTokenMatch(/^!/), "not"],
                    [new RegExpTokenMatch(/^[?]>/), "endOfPhp", "-pop"],
                    [new RegExpTokenMatch(/^[?]/), "questionMark"],
                ],
                comment: [
                    [new RegExpTokenMatch(/^\\/), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^\\*]+/), "string"],
                    [new RegExpTokenMatch(/^[*]\//), "commentEnd", "-pop"],
                    [new RegExpTokenMatch(/^[*]/), "string"], // Last for a reason
                ],
                escape: [
                    [new RegExpTokenMatch(/^./), "escapedChar", "-pop"],
                ],
                heredoc: [
                    [null, "endheredoc", "-pop"],
                    [new RegExpTokenMatch(/^\\/), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^'\\]+/), "string"],
                ],
                inlineComment: [
                    [new RegExpTokenMatch(/^[^\n]+/), "string"],
                    [new RegExpTokenMatch(/^\n/), "lineEnd", "-pop"],
                ],
                nowdoc: [
                    [null, "endnowdoc", "-pop"],
                    [new RegExpTokenMatch(/^\\/), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^'\\]+/), "string"],
                ],
                stringDouble: [
                    [new RegExpTokenMatch(/^\\/), "escape", "escape"],
                    [new RegExpTokenMatch(/^"/), "quoteDouble", "-pop"],
                    [new RegExpTokenMatch(/^[^"\\]+/), "string"],
                ],
                stringSingle: [
                    [new RegExpTokenMatch(/^\\/), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^'\\]+/), "string"],
                    [new RegExpTokenMatch(/^'/), "quoteSingle", "-pop"],
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
                let t
                for(const [r, n, new_mode, end_marker_expr] of possible[mode]) {
                    if(!r && end_marker && contents.substring(0, end_marker.length) == end_marker) {
                        contents = contents.substring(end_marker.length)
                        chunks.push(new Token(n, end_marker, position.immutableCopy))
                        position.consume(end_marker)
                        mode = modes.pop()
                        end_marker = end_markers.pop()
                        break
                    } else if(r && (t = r.matches(contents)) !== null) {
                        contents = contents.substring(t.length)
                        chunks.push(new Token(n, t, position.immutableCopy))
                        position.consume(t)
                        if(new_mode) {
                            if(new_mode == "-pop") {
                                mode = modes.pop()
                                end_marker = end_markers.pop()
                            } else {
                                modes.push(mode)
                                mode = new_mode
                                end_markers.push(end_marker)
                                end_marker = end_marker_expr ? r.replace(t, end_marker_expr) : null
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