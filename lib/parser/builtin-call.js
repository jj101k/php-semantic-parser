import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

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
                openBracket: () => ({mode: "bracketedArgument"}),
                space: () => ({mode: "argument"}),
            },
            maybeEnd: {
                comma: () => ({mode: "argument"}),
                space: () => {},
                $else: () => this.nope,
            },
            postBracketedArgument: {
                comma: () => ({mode: "bracketedArgument"}),
                closeBracket: () => this.end,
            },
        }
    }
}
