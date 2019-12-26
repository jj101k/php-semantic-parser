import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
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
            initial: {
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "postBlock", reconsume: true}
                },
                space: () => {},
            },
            postBlock: {
                bareword_while: () => ({mode: "while"}),
                space: () => {},
            },
            postExpression: {
                closeBracket: () => ({mode: "preEnd"}),
            },
            preEnd: {
                semicolon: () => ({mode: "end"}),
            },
            while: {
                openBracket: () => ({ mode: "expression" }),
                space: () => {},
            },
        }
    }
}
export class ParserWhile extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
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
