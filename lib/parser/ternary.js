import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserTernary extends ParserBase {
    constructor(test) {
        super()
        this.test = test
    }
    get modes() {
        return {
            ifFalse: ParserExpression.expressionParser(
                php => this.ifFalse = php,
                "end"
            ),
            initial: {
                colon: () => {
                    this.ifTrue = this.test
                    return {mode: "ifFalse"}
                },
                ...ParserExpression.expressionParser(
                    php => this.ifTrue = php,
                    "postTrue"
                ),
            },
            postTrue: {
                colon: () => ({mode: "ifFalse"}),
                space: () => {},
            },
        }
    }
}
