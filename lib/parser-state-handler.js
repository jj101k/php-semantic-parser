import { ParserStateChange } from "./parser-state-change";

export class ParserStateHandler {
    /**
     * @param {{[token_type: string]: (c: string) => (ParserStateChange|void)}} handlers
     */
    constructor(handlers) {
        this.handlers = handlers
    }
}