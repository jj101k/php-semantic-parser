import { ParserBase } from "./parser/base";
import { ParserStateHandler, ParserStateHandlerEnd } from "./parser-state-handler";

export class ParserStateChange {
    static get end() {
        return new ParserStateChange(null, new ParserStateHandlerEnd())
    }
    /**
     * Returns a change between modes
     *
     * @param {?ParserStateHandler} mode
     */
    static mode(mode) {
        return new ParserStateChange(null, mode)
    }
    /**
     *
     * @param {?ParserBase} consumer
     * @param {?ParserStateHandler} mode
     * @param {?number} reconsume_last
     */
    constructor(consumer, mode = null, reconsume_last = 0) {
        this.consumer = consumer
        this.mode = mode
        this.reconsumeLast = reconsume_last
    }
}