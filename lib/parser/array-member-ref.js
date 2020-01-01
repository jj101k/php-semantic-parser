import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

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
                closeSquare: () => ({ mode: "end" }),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                )
            },
            next: {
                closeSquare: () => ({ mode: "end" }),
            },
        }
    }
}

export class ParserCurlyArrayMemberRef extends ParserArrayMemberRef {
    get modes() {
        return {
            initial: {
                closeCurly: () => ({ mode: "end" }),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                )
            },
            next: {
                closeCurly: () => ({ mode: "end" }),
            },
        }
    }
}
