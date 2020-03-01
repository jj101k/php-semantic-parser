import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

export class ParserThrow extends ParserBase {
    get modes() {
        return {
            initial: {
                space: () => new ParserStateChange(null, "argument"),
            },
            argument: ParserExpression.expressionParser(
                php => this.source = php,
                "postArgument"
            ),
            postArgument: {
                semicolon: () => new ParserStateChange(null, "end"),
                space: () => { },
            },
        }
    }
}