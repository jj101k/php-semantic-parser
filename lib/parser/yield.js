import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserYield extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.from = false
    }
    get modes() {
        return {
            initial: {
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                ),
                bareword_from: () => {
                    this.from = true
                    return {mode: "postFrom"}
                },
            },
            lineEnd: {
                semicolon: () => ({mode: "end"}),
            },
            postFrom: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "lineEnd"
            ),
            postLeft: {
                ...ParserExpression.endOfExpressionParser("lineEnd"),
                fatArrow: () => ({mode: "right"}),
            },
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "lineEnd",
                true
            ),
        }
    }
}
