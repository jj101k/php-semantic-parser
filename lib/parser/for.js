import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"

export class ParserFor extends ParserBase {
    get modes() {
        return {
            increment: ParserExpression.expressionParser(
                php => this.increment = php,
                "postIncrement",
                true
            ),
            init: ParserExpression.expressionParser(
                php => this.init = php,
                "postInit",
                true
            ),
            initial: {
                openBracket: () => ({ mode: "init" }),
                space: () => {},
            },
            postIncrement: {
                closeBracket: () => ({mode: "postSetup"}),
                space: () => {},
            },
            postInit: {
                semicolon: () => ({mode: "test"}),
                space: () => {},
            },
            postSetup: {
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "end", reconsumeLast: 1}
                },
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
            postTest: {
                semicolon: () => ({mode: "increment"}),
                space: () => {},
            },
            test: ParserExpression.expressionParser(
                php => this.test = php,
                "postTest",
                true
            ),
        }
    }
}
