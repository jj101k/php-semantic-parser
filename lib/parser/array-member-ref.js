import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserArrayMemberRef extends ParserBase {
    constructor(array_ref) {
        super()
        this.arrayRef = array_ref
        this.nodes = []
    }
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
