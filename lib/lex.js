import { LexConfig } from "./lex-config"

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

class TokenFinder {
    /**
     *
     * @param {string} type
     */
    constructor(type) {
        this.type = type
    }
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
     * @type {number} Higher is better
     */
    get orderPriority() {
        return this.minLength
    }
    /**
     *
     * @param {string} r
     * @param {string} t
     * @returns {string}
     */
    endMatchGiven(r, t) {
        return r
    }
    /**
     *
     * @param {string} s
     * @param {Position} position
     * @returns {?string}
     */
    matches(s, position) {
        throw new Error("Not implemented")
    }
    /**
     *
     * @param {string} contents
     * @param {MutablePosition} position
     * @return {Token[]}
     */
    parse(contents, position) {
        const t = this.matches(contents, position)
        if(t !== null) {
            if(!t.length) {
                throw new Error(`Produced nonsense token of type ${this.type}`)
            }
            const token = new Token(this.type, t, position.immutableCopy)
            if(process.env.debug) {
                console.log("" + token)
            }
            position.consume(t)
            return [token]
        } else {
            return []
        }
    }
}
class TokenFinderRegExp extends TokenFinder {
    /**
     *
     * @param {string} type
     * @param {RegExp} v
     * @param {number} min_length
     * @param {number} max_length
     */
    constructor(type, v, min_length = 1, max_length = Infinity) {
        super(type)
        this.value = v
        this.minLength = min_length
        this.maxLength = max_length
    }
    get maxLength() {
        return this._maxLength
    }
    set maxLength(v) {
        this._maxLength = v
    }
    get minLength() {
        return this._minLength
    }
    set minLength(v) {
        this._minLength = v
    }
    endMatchGiven(r, t) {
        return t.replace(this.value, r)
    }
    /**
     *
     * @param {string} s
     * @param {Position} position
     * @returns {?string}
     */
    matches(s, position) {
        const md = s.substring(position.offset).match(this.value)
        return md ? md[0] : null
    }
}
class TokenFinderString extends TokenFinder {
    /**
     *
     * @param {string} type
     * @param {string} v
     */
    constructor(type, v) {
        super(type)
        this.value = v
    }
    get maxLength() {
        return this.value.length
    }
    get minLength() {
        return this.value.length
    }
    /**
     *
     * @param {string} s
     * @param {Position} position
     * @returns {?string}
     */
    matches(s, position) {
        if(s.startsWith(this.value, position.offset)) {
            return this.value
        } else {
            return null
        }
    }
}

class TokenFinderRecursive extends TokenFinder {
    /**
     *
     * @param {string} type
     * @param {import("./lex-config").lexConfigDetail} v
     * @param {TokenFinder} m
     */
    constructor(type, v, m) {
        super(type)
        this.finder = m
        this.abortMatch = v.abortMatch
        this.endMatch = (v.endMatch !== undefined) ? v.endMatch : null
        if(typeof v.then == "string") {
            this.thenAlias = v.then
        } else {
            this.then = new TokenFinderConfig(v.then)
        }
    }
    get maxLength() {
        return this.finder.maxLength
    }
    get minLength() {
        return this.finder.minLength
    }
    /**
     * @type {TokenFinderConfig | undefined}
     */
    get then() {
        if(!this._then) {
            if(this.thenAlias) {
                const t = Lex.finder.tokens.find(
                    t => t.type == this.thenAlias
                )
                if(t instanceof TokenFinderRecursive) {
                    this._then = t.then
                } else {
                    throw new Error("Lexer internal error: link to non-recursive " + this.thenAlias)
                }
            }
        }
        return this._then
    }
    set then(v) {
        this._then = v
    }
    /**
     *
     * @param {string} t
     */
    endMatchFor(t) {
        if(this.endMatch) {
            return this.finder.endMatchGiven(this.endMatch, t)
        } else {
            return t
        }
    }
    /**
     *
     * @param {string} s
     * @param {Position} position
     * @returns {?string}
     */
    matches(s, position) {
        return this.finder.matches(s, position)
    }
    /**
     *
     * @param {string} contents
     * @param {MutablePosition} position
     */
    parse(contents, position) {
        const old_offset = position.offset
        const tokens = this.finder.parse(contents, position)
        if(tokens.length) {
            return [
                ...tokens,
                ...this.then.tokensFrom(
                    contents,
                    position,
                    {
                        finder: this,
                        startMarker: contents.substring(old_offset, position.offset)
                    }
                ),
            ]
        } else {
            return []
        }
    }
}

class TokenFinderConfig {
    /**
     *
     * @param {import("./lex-config").lexConfigDetail["then"]} t
     */
    constructor(t) {
        /**
         * @type {TokenFinder[]}
         */
        this.tokens = []
        for(const [token, v] of Object.entries(t)) {
            this.tokens.push(...Lex.buildFinders(token, v))
        }
        this.tokens.sort((a, b) => b.orderPriority - a.orderPriority)
    }
    /**
     *
     * @param {string} contents
     * @param {MutablePosition} position
     * @param {{finder: TokenFinderRecursive, startMarker: string} | undefined} parent_state
     * @return {Token[]}
     */
    tokensFrom(contents, position, parent_state = undefined) {
        const abort_marker = parent_state && parent_state.finder.abortMatch
        const end_marker = parent_state &&
            parent_state.finder.endMatchFor(parent_state.startMarker)
        /**
         * @type {Token[]}
         */
        const chunks = []
        while(contents.length > position.offset) {
            const old_offset = position.offset
            if(end_marker && contents.startsWith(end_marker, old_offset)) {
                chunks.push(new Token("$pop", end_marker, position.immutableCopy))
                if(process.env.debug) {
                    console.log("" + chunks[chunks.length - 1])
                }
                position.consume(end_marker)
                return chunks
            } else if(abort_marker && contents.startsWith(abort_marker, old_offset)) {
                chunks.push(new Token("$pop", abort_marker, position.immutableCopy))
                if(process.env.debug) {
                    console.log("" + chunks[chunks.length - 1])
                }
                return chunks
            }
            for(const finder of this.tokens) {
                const new_chunks = finder.parse(contents, position)
                if(new_chunks.length) {
                    chunks.push(...new_chunks)
                    break
                }
            }
            if(position.offset == old_offset) {
                const hint = contents.substring(old_offset, old_offset + 15) + "..."
                throw new Error(
                    `Lexer failed to find a match @${position} with ${JSON.stringify(hint)}
                    given supported tokens: ${this.tokens.map(t => t.type).join(",")}
                    and end marker: ${JSON.stringify(end_marker)}`
                )
            }
        }
        return chunks
    }
}

export class Lex {
    static get finder() {
        if(!this._finder) {
            this._finder = new TokenFinderConfig(LexConfig)
        }
        return this._finder
    }
    /**
     * @param {string} type
     * @param {import("./lex-config").lexConfig[""]} v
     * @returns {TokenFinder[]}
     */
    static buildFinders(type, v) {
        if(typeof v == "string") {
            return [new TokenFinderString(type, v)]
        } else if(v instanceof RegExp) {
            return [new TokenFinderRegExp(type, v)]
        } else if(v instanceof Array) {
            /**
             * @type {TokenFinder[]}
             */
            const out = []
            for(const vi of v) {
                out.push(...this.buildFinders(type, vi))
            }
            return out
        } else if("pattern" in v) {
            return [new TokenFinderRegExp(type, v.pattern, v.minLength, v.maxLength || Infinity)]
        } else {
            const finders = this.buildFinders(type, v.match)
            return finders.map(f => new TokenFinderRecursive(type, v, f))
        }
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
            this._tokens = Lex.finder.tokensFrom(this.contents, new MutablePosition())
        }
        return this._tokens
    }
}
