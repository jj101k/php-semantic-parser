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
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const initial = new ParserStateHandler({
            closeSquare: () => ParserStateChange.mode("end"),
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "next"
            ).handlers
        })
        const next = new ParserStateHandler({
            closeSquare: () => ParserStateChange.mode("end"),
        })
        return {initial, next}
    }
}

export class ParserCurlyArrayMemberRef extends ParserArrayMemberRef {
    get modes() {
        const initial = new ParserStateHandler({
            closeCurly: () => ParserStateChange.mode("end"),
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "next"
            ).handlers
        })
        const next = new ParserStateHandler({
            closeCurly: () => ParserStateChange.mode("end"),
        })
        return {initial, next}
    }
}
