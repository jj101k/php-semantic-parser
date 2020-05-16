import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression } from "./expression"

export class ParserStaticBitOperator extends ParserBase {
    /**
     *
     * @param {string} operator
     * @param {ParserBase} left
     */
    constructor(operator, left) {
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
export class ParserStaticBooleanOperator extends ParserBase {
    /**
     *
     * @param {string} operator
     * @param {ParserBase} left
     */
    constructor(operator, left) {
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

export class ParserStaticCoalesceOperator extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     */
    constructor(left) {
        super()
        this.left = left
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

export class ParserBitOperator extends ParserStaticBitOperator {
    get expressionClass() {
        return ParserExpression
    }
}
export class ParserBooleanOperator extends ParserStaticBooleanOperator {
    get expressionClass() {
        return ParserExpression
    }
}

export class ParserCoalesceOperator extends ParserStaticCoalesceOperator {
    get expressionClass() {
        return ParserExpression
    }
}