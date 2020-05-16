import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserSpread extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        return ParserExpression.expressionParser(
            php => this.nodes.push(php)
        )
    }
}