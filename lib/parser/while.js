import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

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
                    return new ParserStateChange(this.block, "postBlock", 1)
                },
                space: () => {},
            },
            postBlock: {
                bareword_while: () => new ParserStateChange(null, "while"),
                space: () => {},
            },
            postExpression: {
                closeBracket: () => new ParserStateChange(null, "preEnd"),
            },
            preEnd: {
                semicolon: () => this.end,
            },
            while: {
                openBracket: () => new ParserStateChange(null, "expression"),
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
                openBracket: () => new ParserStateChange(null, "expression"),
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
                semicolon: () => this.end,
            },
            postExpression: {
                closeBracket: () => new ParserStateChange(null, "postSetup"),
                space: () => {},
            },
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
