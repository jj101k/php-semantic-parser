import { ParserBase } from "./base"
import { ParserExpressionList } from "./expression-list"
import { ParserExpression } from "./expression"
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
                    return {mode: "postVarName"}
                },
            },
            postSquare: {
                closeSquare: () => ({mode: "postVarName"}),
            },
            postVarName: {
                closeBracket: () => ({mode: "end", reconsume: true}),
                comma: () => ({mode: "end", reconsume: true}),
                openBracket: () => {
                    this.arguments = new ParserExpressionList()
                    return { consumer: this.arguments, mode: "end" }
                },
                openSquare: () => {
                    const e = new ParserExpression()
                    return {consumer: e, mode: "postSquare"}
                },
                space: () => {},
            },
        }
    }
}
