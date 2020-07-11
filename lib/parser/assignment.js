import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateHandler } from "../parser-state-handler"
import { ParserVariable } from "./variable"
import { ParserClassValueReference } from "./class-value-reference"

export class ParserAssignment extends ParserBase {
    /**
     *
     * @param {ParserVariable | ParserClassValueReference} left
     */
    constructor(left) {
        super()
        this.brRef = false
        this.left = left
    }
    get initialMode() {
        return new ParserStateHandler({
            ...ParserExpression.expressionParser(
                php => {
                    this.right = php
                    if(this.left instanceof ParserVariable) {
                        this.namespace.set(this.left.name, null)
                    }
                }
            ).handlers,
            ampersand: () => {this.byRef = true},
        })
    }
}
