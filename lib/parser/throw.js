import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserThrow extends ParserBase {
    get modes() {
        return {
            initial: {
                space: () => ({ mode: "argument" }),
            },
            argument: ParserExpression.expressionParser(
                php => this.source = php,
                "postArgument"
            ),
            postArgument: {
                semicolon: () => ({ mode: "end" }),
                space: () => { },
            },
        }
    }
}