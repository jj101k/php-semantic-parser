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
    toString() {
        return "" + this.regexp
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
    toString() {
        return JSON.stringify(this.tokens)
    }
}
class TokenFinder {
    /**
     *
     * @param {?TokenMatch} match
     * @param {string} type
     * @param {?string} new_mode
     */
    constructor(match, type, new_mode = null) {
        this.match = match
        this.newMode = new_mode
        this.type = type
    }
    get maxLength() {
        if(this.match) {
            return this.match.maxLength
        } else {
            return Infinity
        }
    }
    get minLength() {
        if(this.match) {
            return this.match.minLength
        } else {
            return 0
        }
    }
    /**
     * @type {number} Higher is better
     */
    get orderPriority() {
        if(this.match) {
            return this.match.minLength
        } else {
            return Infinity
        }
    }
    /**
     *
     * @param {string} t
     * @returns {?string}
     */
    endMarker(t) {
        return null
    }
    /**
     *
     * @param {string} s
     * @param {?string | undefined} end_marker
     */
    matches(s, end_marker) {
        if(this.match) {
            return this.match.matches(s)
        } else if(end_marker && s.substring(0, end_marker.length) == end_marker) {
            return end_marker
        } else {
            return null
        }
    }
}
class TokenFinderEndable extends TokenFinder {
    /**
     *
     * @param {TokenMatch} match
     * @param {string} type
     * @param {string} new_mode
     * @param {string} end_marker_expr
     */
    constructor(match, type, new_mode, end_marker_expr) {
        super(match, type, new_mode)
        this.match = match
        this.endMarkerExpr = end_marker_expr
    }
    endMarker(t) {
        return this.match.replace(t, this.endMarkerExpr)
    }
}
export class Lex {
    static get possible() {
        if(!this._possible) {
            /**
             * @type {{[mode: string]: TokenFinder[]}}
             */
            this._possible = {
                html: [
                    new TokenFinder(new RegExpTokenMatch(/^.*?<[?]php\b/s, 5), "php", "none"),
                    new TokenFinder(new RegExpTokenMatch(/^.*/s, 0), "other"),
                ],
                none: [
                    new TokenFinderEndable(new RegExpTokenMatch(/^<<<'(\w+)'/, 5), "nowdoc", "nowdoc", "\n$1"),
                    new TokenFinderEndable(new RegExpTokenMatch(/^<<<(\w+)/, 3), "heredoc", "heredoc", "\n$1"),
                    new TokenFinder(new StringTokenMatch("..."), "ellipsis"),
                    new TokenFinder(new RegExpTokenMatch(/^\s+/), "space"),
                    new TokenFinder(new StringTokenMatch("/**"), "comment", "comment"),
                    new TokenFinder(new StringTokenMatch("/*"), "comment", "comment"),
                    new TokenFinder(new RegExpTokenMatch(/^\\?[_a-zA-Z][\w\\]*/), "bareword"),
                    new TokenFinder(new StringTokenMatch("("), "openBracket"),
                    new TokenFinder(new StringTokenMatch(")"), "closeBracket"),
                    new TokenFinder(new StringTokenMatch("["), "openSquare"),
                    new TokenFinder(new StringTokenMatch("]"), "closeSquare"),
                    new TokenFinder(new StringTokenMatch("{"), "openCurly"),
                    new TokenFinder(new StringTokenMatch("}"), "closeCurly"),
                    new TokenFinder(new RegExpTokenMatch(/^\d+([.]\w+)?/), "number"),
                    new TokenFinder(new RegExpTokenMatch(/^[.]\d+/, 2), "number"),
                    new TokenFinder(new RegExpTokenMatch(/^0b[01]+/, 3), "number"),
                    new TokenFinder(new RegExpTokenMatch(/^0x[0-9a-f]+/i, 3), "number"),
                    new TokenFinder(new StringTokenMatch(".="), "inPlaceConcatenation"),
                    new TokenFinder(new StringTokenMatch("."), "dot"),
                    new TokenFinder(new StringTokenMatch("->"), "arrow"),
                    new TokenFinder(new StringTokenMatch("=>"), "fatArrow"),
                    new TokenFinder(new StringTokenMatch(","), "comma"),
                    new TokenFinder(new RegExpTokenMatch(/^[$][_a-zA-Z]\w*/, 2), "varname"),
                    new TokenFinder(new StringTokenMatch("\""), "quoteDouble", "stringDouble"),
                    new TokenFinder(new StringTokenMatch("'"), "quoteSingle", "stringSingle"),
                    new TokenFinder(new StringTokenMatch("//"), "inlineComment", "inlineComment"),
                    new TokenFinder(new StringTokenMatch("++"), "plusplus"),
                    new TokenFinder(new StringTokenMatch("--"), "minusminus"),
                    new TokenFinder(new StringTokenMatch("*=", "/=", "+=", "-="), "inPlaceMathsOperator"),
                    new TokenFinder(new StringTokenMatch("+", "-"), "unaryMathsOperator"),
                    new TokenFinder(new StringTokenMatch("*", "/", "%"), "mathsOperator"),
                    new TokenFinder(new StringTokenMatch("&&", "||"), "booleanOperator"),
                    new TokenFinder(new StringTokenMatch("&"), "ampersand"),
                    new TokenFinder(new StringTokenMatch("|", "^"), "bitOperator"),
                    new TokenFinder(new StringTokenMatch(";"), "semicolon"),
                    new TokenFinder(new StringTokenMatch("::"), "doubleColon"),
                    new TokenFinder(new StringTokenMatch(":"), "colon"),
                    new TokenFinder(new StringTokenMatch("==="), "equals3"),
                    new TokenFinder(new StringTokenMatch("=="), "equals2"),
                    new TokenFinder(new StringTokenMatch("="), "equals"),
                    new TokenFinder(new StringTokenMatch("@"), "at"),
                    new TokenFinder(new StringTokenMatch("<=>"), "spaceship"),
                    new TokenFinder(new StringTokenMatch(">="), "greaterEquals"),
                    new TokenFinder(new StringTokenMatch(">"), "greaterThan"),
                    new TokenFinder(new StringTokenMatch("<="), "lessEquals"),
                    new TokenFinder(new StringTokenMatch("<"), "lessThan"),
                    new TokenFinder(new StringTokenMatch("!=="), "notEquals3"),
                    new TokenFinder(new StringTokenMatch("!="), "notEquals2"),
                    new TokenFinder(new StringTokenMatch("!"), "not"),
                    new TokenFinder(new StringTokenMatch("?>"), "endOfPhp", "-pop"),
                    new TokenFinder(new StringTokenMatch("??"), "doubleQuestionMark"),
                    new TokenFinder(new StringTokenMatch("?"), "questionMark"),
                ],
                comment: [
                    new TokenFinder(new StringTokenMatch("\\"), "escape", "escape"),
                    new TokenFinder(new RegExpTokenMatch(/^[^\\*]+/), "string"),
                    new TokenFinder(new StringTokenMatch("*/"), "commentEnd", "-pop"),
                    new TokenFinder(new StringTokenMatch("*"), "string"), // Last for a reason
                ],
                escape: [
                    new TokenFinder(new RegExpTokenMatch(/^./), "escapedChar", "-pop"),
                ],
                heredoc: [
                    new TokenFinder(null, "endheredoc", "-pop"),
                    new TokenFinder(new StringTokenMatch("\\"), "escape", "escape"),
                    new TokenFinder(new RegExpTokenMatch(/^\n/), "string"),
                    new TokenFinder(new RegExpTokenMatch(/^[^\\\n]+/), "string"),
                ],
                inlineComment: [
                    new TokenFinder(new RegExpTokenMatch(/^[^\n]+/), "string"),
                    new TokenFinder(new StringTokenMatch("\n"), "lineEnd", "-pop"),
                ],
                nowdoc: [
                    new TokenFinder(null, "endnowdoc", "-pop"),
                    new TokenFinder(new StringTokenMatch("\\"), "escape", "escape"),
                    new TokenFinder(new RegExpTokenMatch(/^\n/), "string"),
                    new TokenFinder(new RegExpTokenMatch(/^[^'\\\n]+/), "string"),
                ],
                stringDouble: [
                    new TokenFinder(new StringTokenMatch("\\"), "escape", "escape"),
                    new TokenFinder(new StringTokenMatch("\""), "quoteDouble", "-pop"),
                    new TokenFinder(new RegExpTokenMatch(/^[^"\\]+/), "string"),
                ],
                stringSingle: [
                    new TokenFinder(new StringTokenMatch("\\"), "escape", "escape"),
                    new TokenFinder(new RegExpTokenMatch(/^[^'\\]+/), "string"),
                    new TokenFinder(new StringTokenMatch("'"), "quoteSingle", "-pop"),
                ],
            }
            for(const tokens of Object.values(this._possible)) {
                tokens.sort(
                    (a, b) => b.orderPriority - a.orderPriority
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
                for(const finder of Lex.possible[mode]) {
                    const t = finder.matches(contents, end_marker)
                    if(t !== null) {
                        if(!t.length) {
                            throw new Error(`Produced nonsense token of type ${finder.type}`)
                        }
                        contents = contents.substring(t.length)
                        chunks.push(new Token(finder.type, t, position.immutableCopy))
                        position.consume(t)
                        if(finder.newMode) {
                            if(finder.newMode == "-pop") {
                                const new_mode = modes.pop()
                                if(!new_mode) {
                                    throw new Error("Tried to pop out of a non-existent mode")
                                }
                                mode = new_mode
                                end_marker = end_markers.pop()
                            } else {
                                modes.push(mode)
                                mode = finder.newMode
                                end_markers.push(end_marker)
                                end_marker = finder.endMarker(t)
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
