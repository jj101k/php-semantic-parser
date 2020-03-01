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
                bareword_while: () => ParserStateChange.mode("while"),
                space: () => {},
            },
            postExpression: {
                closeBracket: () => ParserStateChange.mode("preEnd"),
            },
            preEnd: {
                semicolon: () => this.end,
            },
            while: {
                openBracket: () => ParserStateChange.mode("expression"),
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
                openBracket: () => ParserStateChange.mode("expression"),
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
                closeBracket: () => ParserStateChange.mode("postSetup"),
                space: () => {},
            },
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
