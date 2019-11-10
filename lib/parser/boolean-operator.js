import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserBooleanOperator extends ParserBase {
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
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.right = php,
                "end"
            ),
        }
    }
}
