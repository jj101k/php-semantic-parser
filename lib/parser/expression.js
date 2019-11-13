import { ParserBase } from "./base"
import { ParserTemplateString } from "./template-string"
import { ParserVariable } from "./variable"
import { ParserStringConcatenation } from "./string-concatenation"
import { ParserPropertyReference } from "./property-reference"
import { ParserFunctionCall } from "./function-call"
import { ParserNew } from "./new"
import { ParserAssignment } from "./assignment"
import { ParserConstant } from "./constant"
import { ParserArray } from "./array"
import { ParserComparison } from "./comparison"
import { ParserClassValueReference } from "./class-value-reference"
import { ParserArrayMemberRef } from "./array-member-ref"
import { ParserTernary } from "./ternary"
import { ParserNumber } from "./number"
import { ParserBooleanOperator as ParserBooleanOperator } from "./boolean-operator"
import { ParserNumberExpression } from "./number-expression"
import { ParserSimpleString } from "./simple-string"
import { ParserInclude } from "./include"
import { ParserClosure } from "./closure"
export class ParserExpression extends ParserBase {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     */
    static expressionParser(f, next_mode) {
        const handle_expression = this.handleExpression(f, next_mode)
        return {
            at: handle_expression,
            bareword: handle_expression,
            bareword_array: handle_expression,
            bareword_function: handle_expression,
            bareword_include: handle_expression,
            bareword_include_once: handle_expression,
            bareword_require: handle_expression,
            bareword_require_once: handle_expression,
            bareword_new: handle_expression,
            not: handle_expression,
            number: handle_expression,
            openBracket: handle_expression,
            openSquare: handle_expression,
            quoteDouble: handle_expression,
            quoteSingle: handle_expression,
            space: () => {},
            varname: handle_expression,
        }
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     */
    static handleExpression(f, next_mode) {
        return () => {
            const php = new ParserExpression()
            f(php)
            return { consumer: php, mode: next_mode, reconsume: true }
        }
    }
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                at: c => {
                    this.silentErrors = true
                    return {}
                },
                bareword: c => {
                    const php = new ParserConstant(c)
                    this.nodes.push(php)
                    return {mode: "postArgument"}
                },
                bareword_array: () => ({mode: "maybeArray"}),
                bareword_function: () => {
                    const php = new ParserClosure()
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                bareword_include: () => {
                    const php = new ParserInclude(false)
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                bareword_include_once: () => {
                    const php = new ParserInclude(false, true)
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                bareword_new: () => {
                    const php = new ParserNew()
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                bareword_require: () => {
                    const php = new ParserInclude(true)
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                bareword_require_once: () => {
                    const php = new ParserInclude(true, true)
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                not: () => {
                    // Unary on the left is a bit complicated but ok if it can
                    // be chained back up
                    this.not = true
                    const expression = new ParserExpression()
                    this.nodes.push(expression)
                    return {consumer: expression, mode: "end"}
                },
                number: c => {
                    const n = new ParserNumber(c)
                    this.nodes.push(n)
                    return {mode: "postArgument"}
                },
                openBracket: () => {
                    const expression = new ParserExpression()
                    this.nodes.push(expression)
                    return {consumer: expression, mode: "postBracket"}
                },
                openSquare: () => {
                    const php = new ParserArray()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                quoteDouble: () => {
                    const php = new ParserTemplateString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                quoteSingle: () => {
                    const php = new ParserSimpleString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                varname: c => {
                    this.nodes.push(new ParserVariable(c))
                    return { mode: "postArgument" }
                },
            },
            maybeArray: {
                openBracket: () => {
                    const php = new ParserArray(true)
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                space: () => {},
            },
            postArgument: Object.assign(
                {
                    arrow: () => {
                        const concatenation = new ParserPropertyReference(this.nodes.pop())
                        this.nodes.push(concatenation)
                        return { consumer: concatenation }
                    },
                    bareword: () => ({ mode: "end", reconsume: true }),
                    bareword_and: () => {
                        const assignment = new ParserBooleanOperator("and", this.nodes.pop())
                        this.nodes.push(assignment)
                        return { consumer: assignment }
                    },
                    bareword_array: () => ({mode: "maybeArray"}),
                    booleanOperator: c => {
                        const assignment = new ParserBooleanOperator(c, this.nodes.pop())
                        this.nodes.push(assignment)
                        return { consumer: assignment }
                    },
                    colon: () => ({ mode: "end", reconsume: true }),
                    closeBracket: () => ({ mode: "end", reconsume: true }),
                    closeSquare: () => ({ mode: "end", reconsume: true }),
                    comma: () => ({ mode: "end", reconsume: true }),
                    dot: () => {
                        const concatenation = new ParserStringConcatenation(this.nodes.pop())
                        this.nodes.push(concatenation)
                        return { consumer: concatenation }
                    },
                    doubleColon: () => {
                        const concatenation = new ParserClassValueReference(this.nodes.pop())
                        this.nodes.push(concatenation)
                        return { consumer: concatenation }
                    },
                    equals: () => {
                        const assignment = new ParserAssignment(this.nodes.pop())
                        this.nodes.push(assignment)
                        return { consumer: assignment }
                    },
                    fatArrow: () => ({ mode: "end", reconsume: true }),
                    mathsOperator: c => {
                        const numberExpression = new ParserNumberExpression(
                            this.nodes.pop(),
                            c
                        )
                        this.nodes.push(numberExpression)
                        return { consumer: numberExpression }
                    },
                    openBracket: () => {
                        const n = new ParserFunctionCall(this.nodes.pop())
                        this.nodes.push(n)
                        return {consumer: n}
                    },
                    openSquare: () => {
                        const n = new ParserArrayMemberRef(this.nodes.pop())
                        this.nodes.push(n)
                        return {consumer: n}
                    },
                    questionMark: () => {
                        const n = new ParserTernary(this.nodes.pop())
                        this.nodes.push(n)
                        return {consumer: n}
                    },
                    semicolon: () => ({ mode: "end", reconsume: true }),
                    space: () => { },
                },
                ParserComparison.expressionParser(() => this.nodes.pop(), p => this.nodes.push(p))
            ),
            postBracket: {
                closeBracket: () => ({mode: "postArgument"}),
                space: () => {},
            },
        }
    }
}
