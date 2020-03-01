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
        return {
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
            initial: new ParserStateHandler({
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "postBlock", 1)
                },
                space: () => {},
            }),
            postBlock: new ParserStateHandler({
                bareword_while: () => ParserStateChange.mode("while"),
                space: () => {},
            }),
            postExpression: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("preEnd"),
            }),
            preEnd: new ParserStateHandler({
                semicolon: () => this.end,
            }),
            while: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("expression"),
                space: () => {},
            }),
        }
    }
}
export class ParserWhile extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("expression"),
                space: () => {},
            }),
            postSetup: new ParserStateHandler({
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
                semicolon: () => this.end,
            }),
            postExpression: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("postSetup"),
                space: () => {},
            }),
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
