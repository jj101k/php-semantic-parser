import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserEcho extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                space: () => ({ mode: "argument" }),
            },
            argument: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "postArgument"
            ),
            postArgument: {
                semicolon: () => ({ mode: "end" }),
                space: () => { },
            },
        }
    }
}
