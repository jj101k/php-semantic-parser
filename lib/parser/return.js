import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserReturn extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                space: () => ({ mode: "argument" }),
                semicolon: () => ({ mode: "end" }),
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
