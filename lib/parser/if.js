import { ParserBase } from "./base"
import { ParserVariable } from "./variable"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
export class ParserIf extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => ({ mode: "expression" }),
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
