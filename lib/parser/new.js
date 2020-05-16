import { ParserBase } from "./base"
import { ParserAnonymousClass } from "./class"
import { ParserExpression } from "./expression"
import { ParserFunctionCall } from "./function-call"
import { ParserPropertyReference } from "./property-reference"
import { ParserClassValueReference } from "./class-value-reference"
import { ParserConstant } from "./constant"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

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
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const openBracket = () => {
            this.arguments = new ParserFunctionCall([this.name || this.nameRef, "new"])
            return new ParserStateChange(this.arguments, new ParserStateHandlerEnd())
        }
        const name = new ParserStateHandler({
            aliasedVarnameStart: () => {
                this.nameRef = new ParserExpression()
                return new ParserStateChange(this.nameRef, postCurly)
            },
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(postName)
            },
            bareword_class: () => {
                this.class = new ParserAnonymousClass()
                return new ParserStateChange(this.class, new ParserStateHandlerEnd(), 1)
            },
            varname: c => {
                this.nameRef = c
                return ParserStateChange.mode(postVarName)
            },
        })
        const postCurly = new ParserStateHandler({
            closeCurly: () => ParserStateChange.mode(postVarName),
        })
        const postName = new ParserStateHandler({
            ...ParserExpression.endOfExpressionParser(),
            doubleColon: () => {
                //@ts-ignore
                this.nameRef = new ParserClassValueReference(new ParserConstant(this.name))
                this.name = null
                return new ParserStateChange(this.nameRef)
            },
            openBracket,
            space: () => {},
        })
        const postSquare = new ParserStateHandler({
            closeSquare: () => ParserStateChange.mode(postVarName),
        })
        const postVarName = new ParserStateHandler({
            ...ParserExpression.endOfExpressionParser(),
            arrow: () => {
                this.nameRef = new ParserPropertyReference(this.nameRef)
                return new ParserStateChange(this.nameRef)
            },
            openBracket,
            openCurly: () => {
                console.warn("Use of curlies for array indices (eg. $foo{\"bar\"}) is deprecated")
                const e = new ParserExpression()
                return new ParserStateChange(e, postCurly)
            },
            openSquare: () => {
                const e = new ParserExpression()
                return new ParserStateChange(e, postSquare)
            },
            space: () => {},
        })
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(name),
        })
    }
}
