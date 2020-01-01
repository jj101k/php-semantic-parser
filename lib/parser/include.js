import { ParserBuiltinCall } from "./builtin-call"

export class ParserInclude extends ParserBuiltinCall {
    /**
     *
     * @param {boolean} is_require
     * @param {boolean} once
     */
    constructor(is_require, once = false) {
        super()
        this.isRequire = is_require
        this.once = once
    }
}
