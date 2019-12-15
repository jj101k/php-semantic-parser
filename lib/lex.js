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
class StringTokenMatch extends TokenMatch {
    /**
     *
     * @param {string[]} tokens
     */
    constructor(...tokens) {
        super()
        this.tokens = tokens
    }
    matches(s) {
        for(const t of this.tokens) {
            if(s.substring(0, t.length) == t) {
                return t
            }
        }
        return null
    }
    replace(t, end_marker_expr) {
        if(this.tokens.includes(t)) {
            return end_marker_expr
        } else {
            return t
        }
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
                    [new StringTokenMatch("/**"), "comment", "comment"],
                    [new StringTokenMatch("/*"), "comment", "comment"],
                    [new RegExpTokenMatch(/^\\?[_a-zA-Z][\w\\]*/), "bareword"],
                    [new StringTokenMatch("("), "openBracket"],
                    [new StringTokenMatch(")"), "closeBracket"],
                    [new StringTokenMatch("["), "openSquare"],
                    [new StringTokenMatch("]"), "closeSquare"],
                    [new StringTokenMatch("{"), "openCurly"],
                    [new StringTokenMatch("}"), "closeCurly"],
                    [new RegExpTokenMatch(/^\d+([.]\w+)?/), "number"],
                    [new StringTokenMatch(".="), "inPlaceConcatenation"],
                    [new StringTokenMatch("."), "dot"],
                    [new StringTokenMatch("->"), "arrow"],
                    [new StringTokenMatch("=>"), "fatArrow"],
                    [new StringTokenMatch(","), "comma"],
                    [new RegExpTokenMatch(/^[$][a-zA-Z]\w*/), "varname"],
                    [new StringTokenMatch("\""), "quoteDouble", "stringDouble"],
                    [new StringTokenMatch("'"), "quoteSingle", "stringSingle"],
                    [new StringTokenMatch("//"), "inlineComment", "inlineComment"],
                    [new StringTokenMatch("++"), "plusplus"],
                    [new StringTokenMatch("--"), "minusminus"],
                    [new StringTokenMatch("*=", "/=", "+=", "-="), "inPlaceMathsOperator"],
                    [new StringTokenMatch("+", "-"), "unaryMathsOperator"],
                    [new StringTokenMatch("*", "/"), "mathsOperator"],
                    [new StringTokenMatch("&&", "||"), "booleanOperator"],
                    [new StringTokenMatch("&"), "ampersand"],
                    [new StringTokenMatch("|", "^"), "bitOperator"],
                    [new StringTokenMatch(";"), "semicolon"],
                    [new StringTokenMatch("::"), "doubleColon"],
                    [new StringTokenMatch(":"), "colon"],
                    [new StringTokenMatch("==="), "equals3"],
                    [new StringTokenMatch("=="), "equals2"],
                    [new StringTokenMatch("="), "equals"],
                    [new StringTokenMatch("@"), "at"],
                    [new StringTokenMatch(">="), "greaterEquals"],
                    [new StringTokenMatch(">"), "greaterThan"],
                    [new StringTokenMatch("<="), "lessEquals"],
                    [new StringTokenMatch("<"), "lessThan"],
                    [new StringTokenMatch("!=="), "notEquals3"],
                    [new StringTokenMatch("!="), "notEquals2"],
                    [new StringTokenMatch("!"), "not"],
                    [new StringTokenMatch("?>"), "endOfPhp", "-pop"],
                    [new StringTokenMatch("?"), "questionMark"],
                ],
                comment: [
                    [new StringTokenMatch("\\"), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^\\*]+/), "string"],
                    [new StringTokenMatch("*/"), "commentEnd", "-pop"],
                    [new StringTokenMatch("*"), "string"], // Last for a reason
                ],
                escape: [
                    [new RegExpTokenMatch(/^./), "escapedChar", "-pop"],
                ],
                heredoc: [
                    [null, "endheredoc", "-pop"],
                    [new StringTokenMatch("\\"), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^'\\]+/), "string"],
                ],
                inlineComment: [
                    [new RegExpTokenMatch(/^[^\n]+/), "string"],
                    [new StringTokenMatch("\n"), "lineEnd", "-pop"],
                ],
                nowdoc: [
                    [null, "endnowdoc", "-pop"],
                    [new StringTokenMatch("\\"), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^'\\]+/), "string"],
                ],
                stringDouble: [
                    [new StringTokenMatch("\\"), "escape", "escape"],
                    [new StringTokenMatch("\""), "quoteDouble", "-pop"],
                    [new RegExpTokenMatch(/^[^"\\]+/), "string"],
                ],
                stringSingle: [
                    [new StringTokenMatch("\\"), "escape", "escape"],
                    [new RegExpTokenMatch(/^[^'\\]+/), "string"],
                    [new StringTokenMatch("'"), "quoteSingle", "-pop"],
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