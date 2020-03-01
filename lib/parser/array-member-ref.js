import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

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
            initial: {
                closeSquare: () => ParserStateChange.mode("end"),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                )
            },
            next: {
                closeSquare: () => ParserStateChange.mode("end"),
            },
        }
    }
}

export class ParserCurlyArrayMemberRef extends ParserArrayMemberRef {
    get modes() {
        return {
            initial: {
                closeCurly: () => ParserStateChange.mode("end"),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                )
            },
            next: {
                closeCurly: () => ParserStateChange.mode("end"),
            },
        }
    }
}
