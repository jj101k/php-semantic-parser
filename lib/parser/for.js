import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

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
            initial: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("init"),
                space: () => {},
            }),
            postIncrement: new ParserStateHandler({
                comma: () => ParserStateChange.mode("increment"), // More!
                closeBracket: () => {
                    this.block = new ParserLine()
                    return new ParserStateChange(this.block, "end")
                },
                space: () => {},
            }),
            postInit: new ParserStateHandler({
                comma: () => ParserStateChange.mode("init"), // More!
                semicolon: () => ParserStateChange.mode("test"),
                space: () => {},
            }),
            postTest: new ParserStateHandler({
                semicolon: () => ParserStateChange.mode("increment"),
                space: () => {},
            }),
            test: ParserExpression.expressionParser(
                php => this.test = php,
                "postTest",
                true
            ),
        }
    }
}
