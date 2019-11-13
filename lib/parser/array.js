import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserArray extends ParserBase {
    /**
     *
     * @param {boolean} old_style
     */
    constructor(old_style) {
        super()
        this.nodes = []
        this.oldStyle = old_style
    }
    get modes() {
        const end_symbol = this.oldStyle ? "closeBracket" : "closeSquare"
        return {
            initial: Object.assign(
                {
                    [end_symbol]: () => ({ mode: "end" }),
                },
                ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            later: Object.assign(
                {
                    [end_symbol]: () => ({ mode: "end" }),
                }, ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            next: {
                [end_symbol]: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
            postLeft: {
                [end_symbol]: () => ({ mode: "end" }),
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
