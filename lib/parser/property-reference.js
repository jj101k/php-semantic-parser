import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
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
            initial: {
                bareword: c => {
                    this.propertyName = c
                    return {mode: "end"}
                },
                openCurly: () => {
                    const php = new ParserExpression()
                    this.propertyNameExpression = php
                    return {consumer: php, mode: "postCurly"}
                },
                varname: c => {
                    this.propertyNameRef = c
                    return {mode: "end"}
                },
            },
            postCurly: {
                closeCurly: () => ({mode: "end"}),
            },
        }
    }
}
