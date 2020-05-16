import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression } from "./expression"

export class ParserStaticNumberExpression extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     * @param {string} operator
     */
    constructor(left, operator) {
        super()
        this.left = left
        this.operator = operator
    }
    get expressionClass() {
        return ParserStaticExpression
    }
    get initialMode() {
        return this.expressionClass.expressionParser(
            php => this.right = php
        )
    }
}

export class ParserNumberExpression extends ParserStaticNumberExpression {
    get expressionClass() {
        return ParserExpression
    }
}