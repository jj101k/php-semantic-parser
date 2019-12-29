import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserAnyBlock } from "./any-block"

export class ParserIf extends ParserBase {
    get modes() {
        return {
            ...ParserAnyBlock.lineModes(php => this.block = php, "end"),
            initial: {
                openBracket: () => ({ mode: "expression" }),
                space: () => {},
            },
            postExpression: {
                closeBracket: () => ({mode: "entry"}),
                space: () => {},
            },
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
