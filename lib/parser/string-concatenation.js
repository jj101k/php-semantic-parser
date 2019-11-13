import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserStringConcatenation extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     * @param {boolean} is_static
     */
    constructor(left, is_static) {
        super()
        this.isStatic = is_static
        this.left = left
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
