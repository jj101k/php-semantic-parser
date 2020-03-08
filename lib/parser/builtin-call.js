import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserBuiltinCall extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const argument = ParserExpression.expressionParser(
            c => {this.variable = c},
            "maybeEnd"
        )
        const bracketedArgument = ParserExpression.expressionParser(
            c => {this.variable = c},
            "postBracketedArgument"
        )
        const initial = new ParserStateHandler({
            openBracket: () => ParserStateChange.mode("bracketedArgument"),
            space: () => ParserStateChange.mode("argument"),
        })
        const maybeEnd = new ParserStateHandler({
            comma: () => ParserStateChange.mode("argument"),
            space: () => {},
            $else: () => this.nope,
        })
        const postBracketedArgument = new ParserStateHandler({
            comma: () => ParserStateChange.mode("bracketedArgument"),
            closeBracket: () => this.end,
        })
        return {argument, bracketedArgument, initial, maybeEnd, postBracketedArgument}
    }
}
