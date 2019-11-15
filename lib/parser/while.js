import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
export class ParserWhile extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => ({ mode: "expression" }),
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "end", reconsume: true}
                },
            },
            postExpression: {
                closeBracket: () => ({mode: "postSetup"}),
                space: () => {},
            },
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}