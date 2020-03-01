import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSpread } from "./spread"
import { ParserStateChange } from "../parser-state-change"

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
        return {
            initial: {
                closeBracket,
                ellipsis,
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                ),
            },
            later: {
                ellipsis,
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                ),
            },
            next: {
                closeBracket,
                comma: () => ParserStateChange.mode("later"),
            },
        }
    }
}
