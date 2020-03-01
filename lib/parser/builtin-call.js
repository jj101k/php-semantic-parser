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
                openBracket: () => new ParserStateChange(null, "bracketedArgument"),
                space: () => new ParserStateChange(null, "argument"),
            },
            maybeEnd: {
                comma: () => new ParserStateChange(null, "argument"),
                space: () => {},
                $else: () => this.nope,
            },
            postBracketedArgument: {
                comma: () => new ParserStateChange(null, "bracketedArgument"),
                closeBracket: () => this.end,
            },
        }
    }
}
