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
        return {
            initial: new ParserStateHandler({
                closeSquare: () => ParserStateChange.mode("end"),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                ).handlers
            }),
            next: new ParserStateHandler({
                closeSquare: () => ParserStateChange.mode("end"),
            }),
        }
    }
}

export class ParserCurlyArrayMemberRef extends ParserArrayMemberRef {
    get modes() {
        return {
            initial: new ParserStateHandler({
                closeCurly: () => ParserStateChange.mode("end"),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                ).handlers
            }),
            next: new ParserStateHandler({
                closeCurly: () => ParserStateChange.mode("end"),
            }),
        }
    }
}
