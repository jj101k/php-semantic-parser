import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserBitOperator extends ParserBase {
    /**
     *
     * @param {string} operator
     * @param {ParserBase} left
     * @param {boolean} is_static
     */
    constructor(operator, left, is_static) {
        super()
        this.isStatic = is_static
        this.left = left
        this.operator = operator
    }
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.right = php,
                "end",
                this.isStatic
            ),
        }
    }
}
export class ParserBooleanOperator extends ParserBase {
    /**
     *
     * @param {string} operator
     * @param {ParserBase} left
     * @param {boolean} is_static
     */
    constructor(operator, left, is_static) {
        super()
        this.isStatic = is_static
        this.left = left
        this.operator = operator
    }
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.right = php,
                "end",
                this.isStatic
            ),
        }
    }
}
