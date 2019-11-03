import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserStringConcatenation extends ParserBase {
    constructor(left) {
        super()
        this.left = left
    }
    get modes() {
        const handle_expression = ParserExpression.handleExpression(
            php => this.right = php,
            "end"
        )
        return {
            initial: {
                space: () => { },
                quoteDouble: handle_expression,
                varname: handle_expression,
            },
        }
    }
}
