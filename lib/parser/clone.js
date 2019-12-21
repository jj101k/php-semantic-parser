import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserClone extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                space: () => ({ mode: "argument" }),
            },
            argument: ParserExpression.expressionParser(
                c => {this.variable = c},
                "end"
            )
        }
    }
}
