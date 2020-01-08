import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"

export class ParserFor extends ParserBase {
    constructor() {
        super()
        this.increment = []
        this.init = []
    }
    get modes() {
        return {
            increment: ParserExpression.expressionParser(
                php => this.increment.push(php),
                "postIncrement",
                true
            ),
            init: ParserExpression.expressionParser(
                php => this.init.push(php),
                "postInit",
                true
            ),
            initial: {
                openBracket: () => ({ mode: "init" }),
                space: () => {},
            },
            postIncrement: {
                comma: () => ({mode: "increment"}), // More!
                closeBracket: () => {
                    this.block = new ParserLine()
                    return {consumer: this.block, mode: "end"}
                },
                space: () => {},
            },
            postInit: {
                comma: () => ({mode: "init"}), // More!
                semicolon: () => ({mode: "test"}),
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
