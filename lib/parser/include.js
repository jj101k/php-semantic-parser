import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserInclude extends ParserBase {
    /**
     *
     * @param {boolean} is_require
     * @param {boolean} once
     */
    constructor(is_require, once = false) {
        super()
        this.isRequire = is_require
        this.once = once
    }
    get modes() {
        return {
            argument: ParserExpression.expressionParser(
                php => this.source = php,
                "end"
            ),
            argumentBracketed: ParserExpression.expressionParser(
                php => this.source = php,
                "closeBracket"
            ),
            closeBracket: {
                closeBracket: () => ({mode: "end"}),
            },
            initial: {
                openBracket: () => ({mode: "argumentBracketed"}),
                space: () => ({mode: "argument"}),
            },
        }
    }
}
