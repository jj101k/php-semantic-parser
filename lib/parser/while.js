import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserDoWhile extends ParserBase {
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(preEnd),
        })
        const expression = ParserExpression.expressionParser(
            php => this.source = php,
            postExpression
        )
        const phpWhile = new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(expression),
            space: () => {},
        })
        const postBlock = new ParserStateHandler({
            bareword_while: () => ParserStateChange.mode(phpWhile),
            space: () => {},
        })
        const preEnd = new ParserStateHandler({
            semicolon: () => this.end,
        })
        return new ParserStateHandler({
            openCurly: () => {
                this.block = new ParserBlock()
                return new ParserStateChange(this.block, postBlock, 1)
            },
            space: () => {},
        })
    }
}
export class ParserWhile extends ParserBase {
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(postSetup),
            space: () => {},
        })
        const expression = ParserExpression.expressionParser(
            php => this.source = php,
            postExpression
        )
        const postSetup = new ParserStateHandler({
            space: () => {},
            openCurly: () => {
                this.block = new ParserBlock()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd(), 1)
            },
            semicolon: () => this.end,
        })
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(expression),
            space: () => {},
        })
    }
}
