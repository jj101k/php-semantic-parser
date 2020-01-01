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
                "end"
            ),
            bracketedArgument: ParserExpression.expressionParser(
                c => {this.variable = c},
                "closeBracket"
            ),
            closeBracket: {
                closeBracket: () => ({mode: "end"}),
            },
            initial: {
                openBracket: () => ({mode: "bracketedArgument"}),
                space: () => ({mode: "argument"}),
            },
        }
    }
}
