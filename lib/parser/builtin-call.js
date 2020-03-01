import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

export class ParserBuiltinCall extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            argument: ParserExpression.expressionParser(
                c => {this.variable = c},
                "maybeEnd"
            ),
            bracketedArgument: ParserExpression.expressionParser(
                c => {this.variable = c},
                "postBracketedArgument"
            ),
            initial: {
                openBracket: () => ParserStateChange.mode("bracketedArgument"),
                space: () => ParserStateChange.mode("argument"),
            },
            maybeEnd: {
                comma: () => ParserStateChange.mode("argument"),
                space: () => {},
                $else: () => this.nope,
            },
            postBracketedArgument: {
                comma: () => ParserStateChange.mode("bracketedArgument"),
                closeBracket: () => this.end,
            },
        }
    }
}
