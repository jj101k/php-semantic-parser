import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserYield extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.from = false
    }
    get modes() {
        return {
            initial: new ParserStateHandler({
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                ).handlers,
                bareword_from: () => {
                    this.from = true
                    return ParserStateChange.mode("postFrom")
                },
            }),
            lineEnd: new ParserStateHandler({
                semicolon: () => this.end,
            }),
            postFrom: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "lineEnd"
            ),
            postLeft: new ParserStateHandler({
                ...ParserExpression.endOfExpressionParser("lineEnd"),
                fatArrow: () => ParserStateChange.mode("right"),
            }),
            right: ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "lineEnd",
                true
            ),
        }
    }
}
