import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserRequire extends ParserBase {
    get modes() {
        return {
            argument: ParserExpression.expressionParser(
                php => this.source = php,
                "postArgument"
            ),
            initial: {
                space: () => ({ mode: "argument" })
            },
            postArgument: {
                semicolon: () => ({ mode: "end" }),
            },
        }
    }
}
