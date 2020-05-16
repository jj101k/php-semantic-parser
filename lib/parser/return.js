import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserReturn extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        const postArgument = new ParserStateHandler({
            semicolon: () => this.end,
            space: () => {},
        })
        return new ParserStateHandler({
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                postArgument
            ).handlers,
            space: () => {},
            semicolon: () => this.end,
        })
    }
}
