import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserArray extends ParserBase {
    /**
     *
     * @param {boolean} is_static
     */
    constructor(is_static) {
        super()
        this.isStatic = is_static
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
                    "postLeft",
                    this.isStatic
                )
            ),
            later: Object.assign(
                {
                    closeSquare: () => ({ mode: "end" }),
                }, ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    this.isStatic
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
                "next",
                this.isStatic
            ),
        }
    }
}

export class ParserOldArray extends ParserBase {
    /**
     *
     * @param {boolean} is_static
     */
    constructor(is_static) {
        super()
        this.isStatic = is_static
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
                    "postLeft",
                    this.isStatic
                )
            ),
            later: Object.assign(
                {
                    closeBracket: () => ({ mode: "end" }),
                }, ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    this.isStatic
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
                "next",
                this.isStatic
            ),
        }
    }
}
