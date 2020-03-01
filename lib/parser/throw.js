import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserThrow extends ParserBase {
    get modes() {
        return {
            initial: new ParserStateHandler({
                space: () => ParserStateChange.mode("argument"),
            }),
            argument: ParserExpression.expressionParser(
                php => this.source = php,
                "postArgument"
            ),
            postArgument: new ParserStateHandler({
                semicolon: () => ParserStateChange.mode("end"),
                space: () => { },
            }),
        }
    }
}