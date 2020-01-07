import { ParserBase } from "./base"
import { ParserClass } from "./class"
import { ParserExpression } from "./expression"
import { ParserFunctionCall } from "./function-call"
import { ParserPropertyReference } from "./property-reference"
import { ParserClassValueReference } from "./class-value-reference"
import { ParserConstant } from "./constant"

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
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const openBracket = () => {
            this.arguments = new ParserFunctionCall([this.name || this.nameRef, "new"])
            return {consumer: this.arguments, mode: "end"}
        }
        return {
            anonymousClass: {
                openBracket: () => {
                    this.arguments = new ParserFunctionCall([this.class, "new"])
                    return {consumer: this.arguments}
                },
                openCurly: () => ({consumer: this.class, mode: "end", reconsumeLast: 1}),
                space: () => {},
            },
            initial: {
                space: () => ({ mode: "name" }),
            },
            name: {
                aliasedVarnameStart: () => {
                    this.nameRef = new ParserExpression()
                    return {consumer: this.nameRef, mode: "postCurly"}
                },
                bareword: c => {
                    this.name = c
                    return {mode: "postName"}
                },
                bareword_class: () => {
                    this.class = new ParserClass(false, false, true)
                    return {mode: "anonymousClass"}
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
                doubleColon: () => {
                    //@ts-ignore
                    this.nameRef = new ParserClassValueReference(new ParserConstant(this.name))
                    this.name = null
                    return {consumer: this.nameRef}
                },
                openBracket,
                space: () => {},
            },
            postSquare: {
                closeCurly: () => ({mode: "postVarName"}),
                closeSquare: () => ({mode: "postVarName"}),
            },
            postVarName: {
                ...ParserExpression.endOfExpressionParser(),
                arrow: () => {
                    this.nameRef = new ParserPropertyReference(this.nameRef)
                    return {consumer: this.nameRef}
                },
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
