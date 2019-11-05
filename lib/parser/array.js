import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserArray extends ParserBase {
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
                fatArrow: () => ({mode: "right"}),
                closeSquare: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ),
        }
    }
}
