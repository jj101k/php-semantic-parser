import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserPropertyReference extends ParserBase {
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
                bareword: c => {
                    this.propertyName = c
                    return this.end
                },
                openCurly: () => {
                    const php = new ParserExpression()
                    this.propertyNameExpression = php
                    return new ParserStateChange(php, "postCurly")
                },
                space: () => {},
                varname: c => {
                    this.propertyNameRef = c
                    return this.end
                },
            }),
            postCurly: new ParserStateHandler({
                closeCurly: () => this.end,
            }),
        }
    }
}
