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
            initial: {
                space: () => ({ mode: "argument" })
            },
        }
    }
}
