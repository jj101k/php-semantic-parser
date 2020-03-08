import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

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

export class ParserPreIncrement extends ParserBase {
    /**
     *
     * @param {number} multiplier
     */
    constructor(multiplier) {
        super()
        this.multiplier = multiplier
    }
    get modes() {
        const initial = ParserExpression.expressionParser(p => this.right = p, "end")
        return {initial}
    }
}