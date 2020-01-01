import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserSpread extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "end"
            ),
        }
    }
}

export class ParserExpressionList extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                closeBracket: () => ({ mode: "end" }),
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "next"
                ),
            },
            later: ParserExpression.expressionParser(
                php => this.nodes.push(php),
                "next"
            ),
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
        }
    }
}
