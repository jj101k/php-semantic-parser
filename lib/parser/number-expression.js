import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserNumberExpression extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     * @param {string} operator
     * @param {boolean} is_static
     */
    constructor(left, operator, is_static) {
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
