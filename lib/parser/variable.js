import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserAliasedVariable extends ParserBase {
    /**
     *
     * @param {?ParserVariable | ParserBase} variable
     */
    constructor(variable = null) {
        super()
        this.variable = variable
    }
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.variable = php,
                "postExpression"
            ),
            postExpression: new ParserStateHandler({
                closeCurly: () => this.end,
            }),
        }
    }
}

export class ParserVariable {
    /**
     *
     * @param {string} name
     * @param {boolean} is_static
     */
    constructor(name, is_static = false) {
        this.isStatic = is_static
        this.name = name
    }
}

export class ParserVariablePBR {
    /**
     *
     * @param {string} name
     */
    constructor(name) {
        this.name = name
    }
}