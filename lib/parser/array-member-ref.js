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
                closeSquare: () => new ParserStateChange(null, "end"),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                )
            },
            next: {
                closeSquare: () => new ParserStateChange(null, "end"),
            },
        }
    }
}

export class ParserCurlyArrayMemberRef extends ParserArrayMemberRef {
    get modes() {
        return {
            initial: {
                closeCurly: () => new ParserStateChange(null, "end"),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                )
            },
            next: {
                closeCurly: () => new ParserStateChange(null, "end"),
            },
        }
    }
}
