import { ParserBase } from "./base"
export class ParserNumber extends ParserBase {
    /**
     *
     * @param {string} c
     */
    constructor(c) {
        super()
        this.value = +c
    }
}
