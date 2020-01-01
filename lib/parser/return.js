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
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postArgument"
                ),
                space: () => {},
                semicolon: () => ({mode: "end"}),
            },
            postArgument: {
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
        }
    }
}
