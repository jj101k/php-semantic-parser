import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserAssignment extends ParserBase {
    constructor(left) {
        super()
        this.brRef = false
        this.left = left
    }
    get modes() {
        const initial = new ParserStateHandler({
            ...ParserExpression.expressionParser(
                php => this.right = php,
                "end"
            ).handlers,
            ampersand: () => {this.byRef = true},
        })
        return {initial}
    }
}
