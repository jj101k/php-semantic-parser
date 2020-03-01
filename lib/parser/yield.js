import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

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
                    return ParserStateChange.mode("postFrom")
                },
            },
            lineEnd: {
                semicolon: () => this.end,
            },
            postFrom: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "lineEnd"
            ),
            postLeft: {
                ...ParserExpression.endOfExpressionParser("lineEnd"),
                fatArrow: () => ParserStateChange.mode("right"),
            },
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "lineEnd",
                true
            ),
        }
    }
}
