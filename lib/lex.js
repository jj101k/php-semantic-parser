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
    toString() {
        return `${this.line+1}:${this.lineOffset}`
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
    toString() {
        /**
         *
         * @param {string} s
         * @returns {string}
         */
        function short_escape(s) {
            /**
             *
             * @param {string} s
             */
            function escape_char(s) {
                switch(s) {
                    case "\n": return "\\n"
                    default:
                        const c = s.charCodeAt(0).toString(16)
                        if(c.length > 2) {
                            return "\\u" + c.padStart(4, "0")
                        } else {
                            return "\\x" + c.padStart(2, "0")
                        }
                }
            }
            return s.replace(
                /^([\s])/,
                (a, $1) => escape_char($1)
            ).replace(
                /([\u0000-\u001f])/g,
                (a, $1) => escape_char($1)
            )
        }
        return `${this.type}@${this.position}: `.padEnd(32) + short_escape(this.content)
    }
}
class TokenMatch {
    /**
     * @type {number}
     */
    get maxLength() {
        throw new Error("Not implemented")
    }
    /**
     * @type {number}
     */
    get minLength() {
        throw new Error("Not implemented")
    }
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
     * @param {number} min_length
     * @param {number} max_length
     */
    constructor(regexp, min_length = 1, max_length = Infinity) {
        super()
        this._maxLength = max_length
        this._minLength = min_length
        this.regexp = regexp
    }
    get maxLength() {
        return this._maxLength
    }
    get minLength() {
        return this._minLength
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
    get maxLength() {
        return this.tokens.reduce(
            (carry, item) => Math.max(item.length, carry),
            0
        )
    }
    get minLength() {
        return this.tokens.reduce(
            (carry, item) => Math.min(item.length, carry),
            0
        )
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
    static get possible() {
        if(!this._possible) {
            this._possible = {
                html: [
                    [new RegExpTokenMatch(/^.*?<[?]php\b/s, 5), "php", "none"],
                    [new RegExpTokenMatch(/^.*/s, 0), "other"],
                ],
                none: [
                    [new RegExpTokenMatch(/^<<<'(\w+)'/, 5), "nowdoc", "nowdoc", "\n$1"],
                    [new RegExpTokenMatch(/^<<<(\w+)/, 3), "heredoc", "heredoc", "\n$1"],
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
                    [new RegExpTokenMatch(/^(\d+([.]\w+)?|[.]\d+)/), "number"],
                    [new StringTokenMatch(".="), "inPlaceConcatenation"],
                    [new StringTokenMatch("."), "dot"],
                    [new StringTokenMatch("->"), "arrow"],
                    [new StringTokenMatch("=>"), "fatArrow"],
                    [new StringTokenMatch(","), "comma"],
                    [new RegExpTokenMatch(/^[$][_a-zA-Z]\w*/, 2), "varname"],
                    [new StringTokenMatch("\""), "quoteDouble", "stringDouble"],
                    [new StringTokenMatch("'"), "quoteSingle", "stringSingle"],
                    [new StringTokenMatch("//"), "inlineComment", "inlineComment"],
                    [new StringTokenMatch("++"), "plusplus"],
                    [new StringTokenMatch("--"), "minusminus"],
                    [new StringTokenMatch("*=", "/=", "+=", "-="), "inPlaceMathsOperator"],
                    [new StringTokenMatch("+", "-"), "unaryMathsOperator"],
                    [new StringTokenMatch("*", "/", "%"), "mathsOperator"],
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
                    [new RegExpTokenMatch(/^\n/), "string"],
                    [new RegExpTokenMatch(/^[^'\\\n]+/), "string"],
                ],
                inlineComment: [
                    [new RegExpTokenMatch(/^[^\n]+/), "string"],
                    [new StringTokenMatch("\n"), "lineEnd", "-pop"],
                ],
                nowdoc: [
                    [null, "endnowdoc", "-pop"],
                    [new StringTokenMatch("\\"), "escape", "escape"],
                    [new RegExpTokenMatch(/^\n/), "string"],
                    [new RegExpTokenMatch(/^[^'\\\n]+/), "string"],
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
            for(const tokens of Object.entries(this._possible)) {
                tokens.sort(
                    (a, b) => b[0].minLength - a[0].minLength
                )
            }
        }
        return this._possible
    }
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
                for(const [r, n, new_mode, end_marker_expr] of Lex.possible[mode]) {
                    if(!r && end_marker && contents.substring(0, end_marker.length) == end_marker) {
                        contents = contents.substring(end_marker.length)
                        chunks.push(new Token(n, end_marker, position.immutableCopy))
                        position.consume(end_marker)
                        mode = modes.pop()
                        end_marker = end_markers.pop()
                        break
                    } else if(r && (t = r.matches(contents)) !== null) {
                        if(!t.length) {
                            throw new Error(`Produced nonsense token of type ${n}`)
                        }
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
                    throw new Error(`Lexer failed to find a match in mode ${mode} @${position} with ${JSON.stringify(last_contents.substring(0, 15) + "...")}`)
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