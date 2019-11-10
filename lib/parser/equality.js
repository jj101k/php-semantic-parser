import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserEquality extends ParserBase {
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
