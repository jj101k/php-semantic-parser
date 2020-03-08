import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserDoWhile extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const expression = ParserExpression.expressionParser(
            php => this.source = php,
            "postExpression"
        )
        const initial = new ParserStateHandler({
            openCurly: () => {
                this.block = new ParserBlock()
                return new ParserStateChange(this.block, "postBlock", 1)
            },
            space: () => {},
        })
        const phpWhile = new ParserStateHandler({
            openBracket: () => ParserStateChange.mode("expression"),
            space: () => {},
        })
        const postBlock = new ParserStateHandler({
            bareword_while: () => ParserStateChange.mode("phpWhile"),
            space: () => {},
        })
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode("preEnd"),
        })
        const preEnd = new ParserStateHandler({
            semicolon: () => this.end,
        })
        return {expression, initial, phpWhile, postBlock, postExpression, preEnd}
    }
}
export class ParserWhile extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const expression = ParserExpression.expressionParser(
            php => this.source = php,
            "postExpression"
        )
        const initial = new ParserStateHandler({
            openBracket: () => ParserStateChange.mode("expression"),
            space: () => {},
        })
        const postSetup = new ParserStateHandler({
            space: () => {},
            openCurly: () => {
                this.block = new ParserBlock()
                return new ParserStateChange(this.block, "end", 1)
            },
            semicolon: () => this.end,
        })
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode("postSetup"),
            space: () => {},
        })
        return {expression, initial, postSetup, postExpression}
    }
}
