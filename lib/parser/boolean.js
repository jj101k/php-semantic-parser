import { ParserBase } from "./base"

export class ParserBoolean extends ParserBase {
    /**
     *
     * @param {boolean} c
     */
    constructor(c) {
        super()
        this.value = c
    }
}