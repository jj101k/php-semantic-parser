import { ParserBase } from "./base"
export class ParserIncrement extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     * @param {number} multiplier
     */
    constructor(left, multiplier) {
        super()
        this.left = left
        this.multiplier = multiplier
    }
    get modes() {
        return {
        }
    }
}
