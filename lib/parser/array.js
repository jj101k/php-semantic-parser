import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserArray extends ParserBase {
    /**
     *
     */
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: Object.assign(
                {
                    closeSquare: () => ({ mode: "end" }),
                },
                ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            later: Object.assign(
                {
                    closeSquare: () => ({ mode: "end" }),
                }, ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            next: {
                closeSquare: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
            postLeft: {
                closeSquare: () => ({ mode: "end" }),
                fatArrow: () => ({mode: "right"}),
                comma: () => ({ mode: "later" }),
            },
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ),
        }
    }
}

export class ParserOldArray extends ParserBase {
    /**
     *
     */
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: Object.assign(
                {
                    closeBracket: () => ({ mode: "end" }),
                },
                ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            later: Object.assign(
                {
                    closeBracket: () => ({ mode: "end" }),
                }, ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
            postLeft: {
                closeBracket: () => ({ mode: "end" }),
                fatArrow: () => ({mode: "right"}),
                comma: () => ({ mode: "later" }),
            },
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ),
        }
    }
}
