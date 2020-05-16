import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

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
    get initialMode() {
        return new ParserStateHandlerEnd()
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
    get initialMode() {
        return ParserExpression.expressionParser(p => this.right = p)
    }
}