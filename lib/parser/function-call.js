import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserFunctionCall extends ParserBase {
    constructor(function_ref) {
        super()
        this.functionRef = function_ref
        this.nodes = []
        this.spread = false
    }
    get modes() {
        return {
            initial: {
                closeBracket: () => ({ mode: "end" }),
                ellipsis: () => {this.spread = true},
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                ),
            },
            later: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "next"
            ),
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
        }
    }
}
