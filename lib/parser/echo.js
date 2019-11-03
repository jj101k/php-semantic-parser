import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserEcho extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const handle_expression = ParserExpression.handleExpression(
            php => this.nodes.push(php),
            "postArgument"
        )
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
