import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserFor extends ParserBase {
    constructor() {
        super()
        this.increment = []
        this.init = []
    }
    get initialMode() {
        const postIncrement = new ParserStateHandler({
            comma: () => ParserStateChange.mode(increment), // More!
            closeBracket: () => {
                this.block = new ParserLine()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd())
            },
            space: () => {},
        })
        const increment = ParserExpression.expressionParser(
            php => this.increment.push(php),
            postIncrement,
            true
        )
        const postInit = new ParserStateHandler({
            comma: () => ParserStateChange.mode(init), // More!
            semicolon: () => ParserStateChange.mode(test),
            space: () => {},
        })
        const init = ParserExpression.expressionParser(
            php => this.init.push(php),
            postInit,
            true
        )
        const postTest = new ParserStateHandler({
            semicolon: () => ParserStateChange.mode(increment),
            space: () => {},
        })
        const test = ParserExpression.expressionParser(
            php => this.test = php,
            postTest,
            true
        )
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(init),
            space: () => {},
        })
    }
}
