import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserClassValueReference extends ParserBase {
    /**
     *
     * @param {ParserBase} object
     */
    constructor(object) {
        super()
        this.object = object
    }
    get modes() {
        return {
            initial: {
                aliasedVarnameStart: () => {
                    this.varNameRef = new ParserExpression()
                    return {consumer: this.varNameRef, mode: "postCurly"}
                },
                bareword: c => {
                    this.constName = c
                    return this.end
                },
                varname: c => {
                    this.varName = c
                    return this.end
                },
            },
            postCurly: {
                closeCurly: () => ({mode: "end"}),
            },
        }
    }
}
