import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserThrow extends ParserBase {
    get modes() {
        const argument = ParserExpression.expressionParser(
            php => this.source = php,
            "postArgument"
        )
        const initial = new ParserStateHandler({
            space: () => ParserStateChange.mode("argument"),
        })
        const postArgument = new ParserStateHandler({
            semicolon: () => ParserStateChange.mode("end"),
            space: () => { },
        })
        return {argument, initial, postArgument}
    }
}