import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

export class ParserThrow extends ParserBase {
    get modes() {
        return {
            initial: {
                space: () => ParserStateChange.mode("argument"),
            },
            argument: ParserExpression.expressionParser(
                php => this.source = php,
                "postArgument"
            ),
            postArgument: {
                semicolon: () => ParserStateChange.mode("end"),
                space: () => { },
            },
        }
    }
}