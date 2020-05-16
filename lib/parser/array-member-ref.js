import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserArrayMemberRef extends ParserBase {
    constructor(array_ref) {
        super()
        this.arrayRef = array_ref
        this.nodes = []
    }
    get initialMode() {
        const next = new ParserStateHandler({
            closeSquare: () => ParserStateChange.end,
        })
        return new ParserStateHandler({
            closeSquare: () => ParserStateChange.end,
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                next
            ).handlers
        })
    }
}

export class ParserCurlyArrayMemberRef extends ParserArrayMemberRef {
    get initialMode() {
        const next = new ParserStateHandler({
            closeCurly: () => ParserStateChange.end,
        })
        return new ParserStateHandler({
            closeCurly: () => ParserStateChange.end,
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                next
            ).handlers
        })
    }
}
