import { ParserBase } from "./base"
import { ParserExpressionList } from "./expression-list"
export class ParserNew extends ParserBase {
    constructor() {
        super()
        /**
         * @type {?string}
         */
        this.name = null
        /**
         * @type {?ParserExpressionList}
         */
        this.arguments = null
    }
    get modes() {
        return {
            argumentList: {
                openBracket: () => {
                    this.arguments = new ParserExpressionList()
                    return { consumer: this.arguments, mode: "end" }
                },
            },
            initial: {
                space: () => ({ mode: "name" }),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return { mode: "argumentList" }
                },
                varname: c => {
                    this.nameRef = c
                    return { mode: "argumentList" }
                },
            },
        }
    }
}
