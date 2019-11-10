import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserComparison extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     * @param {string} operator
     */
    constructor(left, operator) {
        super()
        this.operator = operator
        this.left = left
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
