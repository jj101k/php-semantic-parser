import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

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
            initial: new ParserStateHandler({
                aliasedVarnameStart: () => {
                    this.varNameRef = new ParserExpression()
                    return new ParserStateChange(this.varNameRef, "postCurly")
                },
                bareword: c => {
                    this.constName = c
                    return this.end
                },
                varname: c => {
                    this.varName = c
                    return this.end
                },
            }),
            postCurly: new ParserStateHandler({
                closeCurly: () => ParserStateChange.mode("end"),
            }),
        }
    }
}
