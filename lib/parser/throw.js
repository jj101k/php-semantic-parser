import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserThrow extends ParserBase {
    get initialMode() {
        const postArgument = new ParserStateHandler({
            semicolon: () => ParserStateChange.end,
            space: () => { },
        })
        const argument = ParserExpression.expressionParser(
            php => this.source = php,
            postArgument
        )
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(argument),
        })
    }
}