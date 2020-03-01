import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

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
            },
            postCurly: {
                closeCurly: () => this.end,
            },
        }
    }
}
