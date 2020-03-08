import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSpread } from "./spread"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserFunctionCall extends ParserBase {
    constructor(function_ref) {
        super()
        this.functionRef = function_ref
        this.nodes = []
    }
    get modes() {
        const ellipsis = () => {
            const s = new ParserSpread()
            return new ParserStateChange(s, "next")
        }
        const closeBracket = () => this.end
        const initial = new ParserStateHandler({
            closeBracket,
            ellipsis,
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "next"
            ).handlers,
        })
        const later = new ParserStateHandler({
            ellipsis,
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "next"
            ).handlers,
        })
        const next = new ParserStateHandler({
            closeBracket,
            comma: () => ParserStateChange.mode("later"),
        })
        return {initial, later, next}
    }
}
