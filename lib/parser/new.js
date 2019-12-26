import { ParserBase } from "./base"
import { ParserExpressionList } from "./expression-list"
import { ParserExpression } from "./expression"
import { ParserClass } from "./class"
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
            postName: {
                closeBracket: () => ({mode: "end", reconsume: true}),
                comma: () => ({mode: "end", reconsume: true}),
                openBracket: () => {
                    this.arguments = new ParserExpressionList()
                    return {consumer: this.arguments, mode: "end"}
                },
                semicolon: () => ({mode: "end", reconsume: true}),
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
                semicolon: () => ({mode: "end", reconsume: true}),
                space: () => {},
            },
        }
    }
}
