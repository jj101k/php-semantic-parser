import { Token } from "../lex"
import { ParserComment } from "./comment"
import { ParserInlineComment } from "./inline-comment"
import { InternalError } from "../internal-error"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserBase {
    static get id() {
        if(this._id === undefined) {
            this._id = 0
        }
        return this._id
    }
    static set id(v) {
        this._id = v
    }
    /**
     * Returns a mode hunk for comments or spaces.
     *
     * @param {(p: ParserBase) => *} f
     */
    static commentOrSpace(f) {
        const comment = () => {
            const c = new ParserComment()
            f(c)
            return new ParserStateChange(c)
        }
        const inlineComment = () => {
            const c = new ParserInlineComment()
            f(c)
            return new ParserStateChange(c)
        }
        const space = () => {}
        return {comment, inlineComment, space}
    }
    constructor() {
        //@ts-ignore
        this.id = this.constructor.id++
    }
    /**
     * Returns a mode hunk for comments or spaces.
     */
    get commentOrSpace() {
        return ParserBase.commentOrSpace(() => {})
    }
    get end() {
        return ParserStateChange.end
    }
    /**
     * @type {ParserStateHandler}
     */
    get initialMode() {
        return new ParserStateHandler({})
    }
    get nope() {
        return new ParserStateChange(null, new ParserStateHandlerEnd(), 1)
    }
    /**
     *
     * @param {Token[]} tokens
     */
    onEOF(tokens) {
        const before = Math.max(tokens.length - 10, 0)
        console.log(tokens.slice(before).join("\n"))
        console.log(this)
        throw new Error("Unterminated value")
    }
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        let mode = this.initialMode
        if(process.env.debug) {
            console.log(`${this.constructor.name} #${this.id} => (initial)`)
        }
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]

            const handler = mode.handlerFor(t)
            if(handler) {
                try {
                    const r = handler(t.content)
                    if(r) {
                        if(r.reconsumeLast) {
                            i-=r.reconsumeLast
                        }
                        if(r.consumer) {
                            const consumed = r.consumer.parse(tokens.slice(i + 1))
                            i += consumed
                        }
                        if(r.mode) {
                            mode = r.mode
                            if(process.env.debug) {
                                console.log(`${this.constructor.name} #${this.id} => ${mode}`)
                            }
                            if(mode instanceof ParserStateHandlerEnd) {
                                return i + 1
                            }
                        }
                    }
                } catch(e) {
                    if(e instanceof InternalError) {
                        throw e
                    } else {
                        const before = Math.max(i - 10, 0)
                        console.log(tokens.slice(before, i).join("\n"))
                        console.log(tokens.slice(i, i + 10).join("\n"))
                        if(t.position) {
                            console.log(`At line ${t.position.line + 1} column ${t.position.lineOffset}`)
                        }
                        throw new InternalError(e.message)
                    }
                }
            } else {
                const before = Math.max(i - 10, 0)
                console.log(tokens.slice(before, i).join("\n"))
                console.log(tokens.slice(i, i + 10).join("\n"))
                const position_info = t.position ?
                    ` at line ${t.position.line + 1} column ${t.position.lineOffset}` :
                    ""
                throw new InternalError(
                    `Unexpected node of type ${t.type} (${t.content}) in ${position_info}\n` +
                    `Supported are: ${Object.keys(mode.handlers)}`)
            }
        }
        this.onEOF(tokens)
        return tokens.length
    }
}
