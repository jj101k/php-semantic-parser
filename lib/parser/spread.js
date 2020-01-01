import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserSpread extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "end"
            ),
        }
    }
}