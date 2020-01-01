import { ParserBase } from "./base"
import { ParserClass } from "./class"
import { ParserExpression } from "./expression"
import { ParserFunctionCall } from "./function-call"

export class ParserNew extends ParserBase {
    constructor() {
        super()
        /**
         * @type {?string}
         */
        this.name = null
        /**
         * @type {?ParserFunctionCall}
         */
        this.arguments = null
    }
    get modes() {
        const openBracket = () => {
            this.arguments = new ParserFunctionCall([this.name || this.nameRef, "new"])
            return {consumer: this.arguments, mode: "end"}
        }
        return {
            initial: {
                space: () => ({ mode: "name" }),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return { mode: "postName" }
                },
                bareword_class: () => {
                    this.class = new ParserClass(false, false, true)
                    return {consumer: this.class, mode: "end"}
                },
                varname: c => {
                    this.nameRef = c
                    return {mode: "postVarName"}
                },
            },
            postCurly: {
                closeCurly: () => ({mode: "postVarName"}),
            },
            postName: {
                ...ParserExpression.endOfExpressionParser(),
                openBracket,
                space: () => {},
            },
            postSquare: {
                closeCurly: () => ({mode: "postVarName"}),
                closeSquare: () => ({mode: "postVarName"}),
            },
            postVarName: {
                ...ParserExpression.endOfExpressionParser(),
                openBracket,
                openCurly: () => {
                    console.warn("Use of curlies for array indices (eg. $foo{\"bar\"}) is deprecated")
                    const e = new ParserExpression()
                    return {consumer: e, mode: "postCurly"}
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
