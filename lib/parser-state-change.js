import { ParserBase } from "./parser/base";

export class ParserStateChange {
    /**
     *
     * @param {string} mode
     */
    static mode(mode) {
        return new ParserStateChange(null, mode)
    }
    /**
     *
     * @param {?ParserBase} consumer
     * @param {?string} mode
     * @param {?number} reconsume_last
     */
    constructor(consumer, mode = null, reconsume_last = 0) {
        this.consumer = consumer
        this.mode = mode
        this.reconsumeLast = reconsume_last
    }
}