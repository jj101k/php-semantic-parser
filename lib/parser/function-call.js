import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserFunctionCall extends ParserBase {
    constructor(function_ref) {
        super()
        this.functionRef = function_ref
        this.nodes = []
    }
    get modes() {
        const handle_expression = () => {
            const php = new ParserExpression()
            this.nodes.push(php)
            return { consumer: php, mode: "postArgument", reconsume: true }
        }
        return {
            initial: {
                bareword: handle_expression,
                closeBracket: () => ({ mode: "end" }),
                quoteDouble: handle_expression,
                varname: handle_expression,
            },
            later: {
                bareword: handle_expression,
                quoteDouble: handle_expression,
                varname: handle_expression,
            },
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
        }
    }
}
