import { ParserBase } from "./base"
import { ParserTemplateString } from "./template-string"
import { ParserVariable } from "./variable"
import { ParserStringConcatenation } from "./string-concatenation"
import { ParserPropertyReference } from "./property-reference"
import { ParserFunctionCall } from "./function-call"
import { ParserNew } from "./new"
import { ParserAssignment } from "./assignment"
export class ParserExpression extends ParserBase {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     */
    static expressionParser(f, next_mode) {
        const handle_expression = this.handleExpression(f, next_mode)
        return {
            bareword_new: handle_expression,
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
                bareword_new: () => {
                    const php = new ParserNew()
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
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
                dot: () => {
                    const concatenation = new ParserStringConcatenation(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                equals: () => {
                    const assignment = new ParserAssignment(this.nodes.pop())
                    this.nodes.push(assignment)
                    return { consumer: assignment }
                },
                openBracket: () => {
                    const n = new ParserFunctionCall(this.nodes.pop())
                    this.nodes.push(n)
                    return {consumer: n}
                },
                semicolon: () => ({ mode: "end", reconsume: true }),
                space: () => { },
            },
        }
    }
}
