import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserAssignment extends ParserBase {
    constructor(left) {
        super()
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
