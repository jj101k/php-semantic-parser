import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserBuiltinCall extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        const maybeEnd = new ParserStateHandler({
            comma: () => ParserStateChange.mode(argument),
            space: () => {},
            $else: () => this.nope,
        })
        const argument = ParserExpression.expressionParser(
            c => {this.variable = c},
            maybeEnd
        )
        const postBracketedArgument = new ParserStateHandler({
            comma: () => ParserStateChange.mode(bracketedArgument),
            closeBracket: () => this.end,
        })
        const bracketedArgument = ParserExpression.expressionParser(
            c => {this.variable = c},
            postBracketedArgument
        )
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(bracketedArgument),
            space: () => ParserStateChange.mode(argument),
        })
    }
}
