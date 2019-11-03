import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserThrow extends ParserBase {
    get modes() {
        const handle_expression = ParserExpression.handleExpression(
            php => this.source = php,
            "end"
        )
        return {
            initial: {
                space: () => {},
                varname: handle_expression,
            },
        }
    }
}