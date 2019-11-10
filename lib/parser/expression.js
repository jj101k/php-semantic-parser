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
import { ParserEquality } from "./equality"
import { ParserClassValueReference } from "./class-value-reference"
import { ParserArrayMemberRef } from "./array-member-ref"
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
            bareword_new: handle_expression,
            not: handle_expression,
            openSquare: handle_expression,
            quoteDouble: handle_expression,
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
                bareword_new: () => {
                    const php = new ParserNew()
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
                varname: c => {
                    this.nodes.push(new ParserVariable(c))
                    return { mode: "postArgument" }
                },
            },
            postArgument: {
                arrow: () => {
                    const concatenation = new ParserPropertyReference(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                bareword: () => ({ mode: "end", reconsume: true }),
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
                equals2: () => {
                    const equality = new ParserEquality(this.nodes.pop())
                    this.nodes.push(equality)
                    return {consumer: equality}
                },
                fatArrow: () => ({ mode: "end", reconsume: true }),
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
                semicolon: () => ({ mode: "end", reconsume: true }),
                space: () => { },
            },
        }
    }
}
