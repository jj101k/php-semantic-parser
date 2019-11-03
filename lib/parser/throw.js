import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserThrow extends ParserBase {
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.source = php,
                "end"
            ),
        }
    }
}