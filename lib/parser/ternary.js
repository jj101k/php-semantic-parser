import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserTernary extends ParserBase {
    constructor(test) {
        super()
        this.test = test
    }
    get initialMode() {
        const ifFalse = ParserExpression.expressionParser(
            php => this.ifFalse = php
        )
        const postTrue = new ParserStateHandler({
            colon: () => ParserStateChange.mode(ifFalse),
            space: () => {},
        })
        return new ParserStateHandler({
            colon: () => {
                this.ifTrue = this.test
                return ParserStateChange.mode(ifFalse)
            },
            ...ParserExpression.expressionParser(
                php => this.ifTrue = php,
                postTrue
            ).handlers,
        })
    }
}
