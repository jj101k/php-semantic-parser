import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"

export class ParserIf extends ParserBase {
    get modes() {
        return {
            entry: {
                ...ParserLine.lineParser(l => this.block = l, "end"),
                space: () => {},
            },
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
