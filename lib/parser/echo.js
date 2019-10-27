import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserEcho extends ParserBase {
    constructor() {
        super()
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
                space: () => ({ mode: "argument" }),
            },
            argument: {
                quoteDouble: handle_expression,
                varname: handle_expression,
            },
            postArgument: {
                semicolon: () => ({ mode: "end" }),
                space: () => { },
            },
        }
    }
}
