import { Token } from "../lex"

/**
 * @typedef {{consumer?: ParserBase, mode?: string, reconsume?: boolean}} parserStateChange
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
    onEOF() {
        throw new Error("Unterminated value")
    }
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        let mode = "initial"
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            const handler =
                this.modes[mode][`${t.type}_${t.content}`] ||
                this.modes[mode][t.type]
            if(handler) {
                const r = handler(t.content)
                if(r) {
                    if(r.reconsume) {
                        i--
                    }
                    if(r.consumer) {
                        const consumed = r.consumer.parse(tokens.slice(i + 1))
                        i += consumed
                    }
                    if(r.mode) {
                        mode = r.mode
                    }
                }
                if(mode == "end") {
                    return i + 1
                }
            }
            else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        this.onEOF()
        return tokens.length
    }
}
