import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserNumberExpression extends ParserBase {
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
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.right = php,
                "end"
            ),
        }
    }
}
