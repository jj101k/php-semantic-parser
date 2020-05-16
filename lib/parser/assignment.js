import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserAssignment extends ParserBase {
    constructor(left) {
        super()
        this.brRef = false
        this.left = left
    }
    get initialMode() {
        return new ParserStateHandler({
            ...ParserExpression.expressionParser(
                php => this.right = php
            ).handlers,
            ampersand: () => {this.byRef = true},
        })
    }
}
