import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserReturn extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const expression = ParserExpression.expressionParser(
            php => this.nodes.push(php),
            "postArgument"
        )
        return {
            initial: {
                ...expression,
                space: () => ({mode: "argument"}),
                semicolon: () => ({mode: "end"}),
            },
            argument: expression,
            postArgument: {
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
        }
    }
}
