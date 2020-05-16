import { ParserStateChange } from "./parser-state-change";
import { Token } from "./lex";

export class ParserStateHandler {
    /**
     * @param {{[token_type: string]: (c: string) => (ParserStateChange|void)}} handlers
     */
    constructor(handlers) {
        this.handlers = handlers
    }
    /**
     *
     * @param {Token} t
     */
    handlerFor(t) {
        const exact_handler = this.handlers[`${t.type}_${t.content.toLowerCase()}`]
        const token_handler = this.handlers[t.type]
        const handler = exact_handler || token_handler || this.handlers["$else"]
        if(handler) {
            return handler
        } else if(this.handlers["$else"]) {
            return this.handlers["$else"]
        } else {
            return null
        }
    }
}
export class ParserStateHandlerEnd extends ParserStateHandler {
    /**
     *
     */
    constructor() {
        super({})
    }
}
