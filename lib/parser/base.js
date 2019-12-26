import { Token } from "../lex"

/**
 * @typedef {{consumer?: ParserBase, mode?: string, reconsumeLast?: number}} parserStateChange
 */
export class ParserBase {
    /**
     * @type {{[mode: string]: {[token_type: string]: (c: string) => (parserStateChange|void)}}}
     */
    get modes() {
        return {
            initial: {
                // This is a dummy value to immediately hit bad-token
            },
        }
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
        let mode = "initial"
        if(process.env.debug) {
            console.log(`${this.constructor.name}: ${mode}`)
        }
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            const handler =
                this.modes[mode][`${t.type}_${t.content}`] ||
                this.modes[mode][t.type]
            if(handler) {
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
                            console.log(`${this.constructor.name} => ${mode}`)
                        }
                    }
                }
                if(mode == "end") {
                    return i + 1
                } else if(!(mode in this.modes)) {
                    throw new Error(`Switched into unsupported mode ${mode}`)
                }
            }
            else {
                const before = Math.max(i - 10, 0)
                console.log(tokens.slice(before, i).join("\n"))
                console.log(tokens.slice(i, i + 10).join("\n"))
                const position_info = t.position ?
                    ` at line ${t.position.line + 1} column ${t.position.lineOffset}` :
                    ""
                throw new Error(`Unexpected node of type ${t.type} in state ${mode}${position_info}`)
            }
        }
        this.onEOF(tokens)
        return tokens.length
    }
}
