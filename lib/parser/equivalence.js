import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserEquivalence extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     * @param {boolean} inverted
     */
    constructor(left, inverted = false) {
        super()
        this.inverted = inverted
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
