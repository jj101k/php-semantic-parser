import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserYield extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                ),
            },
            postLeft: {
                ...ParserExpression.endOfExpressionParser(),
                fatArrow: () => ({mode: "right"}),
            },
            preEnd: {
                semicolon: () => ({mode: "end"}),
            },
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "preEnd",
                true
            ),
        }
    }
}
