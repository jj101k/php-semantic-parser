import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserInstanceof extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     */
    constructor(left) {
        super()
        this.left = left
    }
    get initialMode() {
        return ParserExpression.expressionParser(
            php => this.right = php
        )
    }
}
