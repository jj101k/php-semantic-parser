import { ParserBase } from "./base"
import { ParserTemplateString, ParserStaticTemplateString } from "./template-string"
import { ParserVariable } from "./variable"
import { ParserStringConcatenation, ParserStaticStringConcatenation } from "./string-concatenation"
import { ParserPropertyReference } from "./property-reference"
import { ParserFunctionCall } from "./function-call"
import { ParserNew } from "./new"
import { ParserAssignment } from "./assignment"
import { ParserConstant } from "./constant"
import { ParserArray, ParserOldArray, ParserStaticArray, ParserStaticOldArray } from "./array"
import { ParserComparison } from "./comparison"
import { ParserClassValueReference } from "./class-value-reference"
import { ParserArrayMemberRef } from "./array-member-ref"
import { ParserTernary } from "./ternary"
import { ParserNumber } from "./number"
import { ParserBooleanOperator as ParserBooleanOperator, ParserBitOperator, ParserStaticBooleanOperator, ParserStaticBitOperator, ParserCoalesceOperator, ParserStaticCoalesceOperator } from "./boolean-operator"
import { ParserNumberExpression, ParserStaticNumberExpression } from "./number-expression"
import { ParserSimpleString } from "./simple-string"
import { ParserInclude } from "./include"
import { ParserClosure, ParserStaticClosure } from "./closure"
import { ParserBoolean } from "./boolean"
import { ParserInstanceof } from "./instanceof"
import { ParserClone } from "./clone"
import { ParserIncrement, ParserPreIncrement } from "./increment"
import { ParserNull } from "./null"
import { ParserListAssignment } from "./list-assignment"

export class ParserStaticExpression extends ParserBase {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     * @param {boolean} allow_empty If true, an initial ), } or ; will make this
     * return in reconsume mode
     * @returns {ParserBase["modes"]["initial"]}
     */
    static expressionParser(f, next_mode, allow_empty = false) {
        const handle_expression = this.handleExpression(f, next_mode)
        const static_tokens = [
            "bareword",
            "bareword_array",
            "bareword_clone",
            "bareword_false",
            "bareword_function",
            "bareword_null",
            "bareword_true",
            "heredoc",
            "nowdoc",
            "minusminus",
            "not",
            "number",
            "openBracket",
            "openSquare",
            "plusplus",
            "quoteDouble",
            "quoteSingle",
            "unaryMathsOperator",
        ]
        const parser = ParserBase.commentOrSpace(() => {})
        for(const t of static_tokens) {
            parser[t] = handle_expression
        }

        if(allow_empty) {
            return {
                ...this.endOfExpressionParser(next_mode),
                ...parser
            }
        } else {
            return parser
        }
    }
    /**
     * Returns a parser for things which, if they appear at the start of an
     * expression or a possible end point, end it and (generally) pass back up.
     *
     * @param {string} next_mode
     * @returns {ParserBase["modes"]["initial"]}
     */
    static endOfExpressionParser(next_mode = "end") {
        const handler = () => ({mode: next_mode, reconsumeLast: 1})
        return {
            closeBracket: handler,
            closeCurly: handler,
            closeSquare: handler,
            colon: handler, // For ternary
            comma: handler,
            fatArrow: handler,
            semicolon: handler,
        }
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     */
    static handleExpression(f, next_mode) {
        return () => {
            const php = new ParserStaticExpression()
            f(php)
            return {consumer: php, mode: next_mode, reconsumeLast: 1}
        }
    }
    /**
     *
     */
    constructor() {
        super()
        this.nodes = []
    }
    get handlerClasses() {
        return {
            Array: ParserStaticArray,
            BitOperator: ParserStaticBitOperator,
            BooleanOperator: ParserStaticBooleanOperator,
            CoalesceOperator: ParserStaticCoalesceOperator,
            Expression: ParserStaticExpression,
            NumberExpression: ParserStaticNumberExpression,
            OldArray: ParserStaticOldArray,
            StringConcatenation: ParserStaticStringConcatenation,
            TemplateString: ParserStaticTemplateString,
        }
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: {
                bareword: c => {
                    const php = new ParserConstant(c)
                    this.nodes.push(php)
                    return {mode: "postArgument"}
                },
                bareword_array: () => ({mode: "maybeArray"}),
                bareword_clone: () => {
                    const php = new ParserClone()
                    this.nodes.push(php)
                    return {consumer: php, mode: "end"}
                },
                bareword_false: () => {
                    const php = new ParserBoolean(false)
                    this.nodes.push(php)
                    return {mode: "postArgument"}
                },
                bareword_function: () => {
                    const php = new ParserClosure()
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                bareword_null: () => {
                    const php = new ParserNull()
                    this.nodes.push(php)
                    return {mode: "postArgument"}
                },
                bareword_true: () => {
                    const php = new ParserBoolean(true)
                    this.nodes.push(php)
                    return {mode: "postArgument"}
                },
                heredoc: () => {
                    const php = new this.handlerClasses.TemplateString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                not: () => {
                    // Unary on the left is a bit complicated but ok if it can
                    // be chained back up
                    this.not = true
                    const expression = new this.handlerClasses.Expression()
                    this.nodes.push(expression)
                    return {consumer: expression, mode: "end"}
                },
                nowdoc: () => {
                    const php = new ParserSimpleString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                number: c => {
                    const n = new ParserNumber(c)
                    this.nodes.push(n)
                    return {mode: "postArgument"}
                },
                openBracket: () => {
                    const expression = new this.handlerClasses.Expression()
                    this.nodes.push(expression)
                    return {consumer: expression, mode: "postBracket"}
                },
                openSquare: () => {
                    const php = new this.handlerClasses.Array()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                quoteDouble: () => {
                    const php = new this.handlerClasses.TemplateString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                quoteSingle: () => {
                    const php = new ParserSimpleString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                space: () => {},
                unaryMathsOperator: c => {
                    this.multiplier = (c == "-") ? -1 : 1
                },
            },
            maybeArray: {
                openBracket: () => {
                    const php = new this.handlerClasses.OldArray()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                space: () => {},
            },
            postArgument: {
                ...ParserExpression.endOfExpressionParser(),
                bareword: () => ({ mode: "end", reconsumeLast: 1 }),
                bareword_and: () => {
                    const assignment = new this.handlerClasses.BooleanOperator("and", this.nodes.pop())
                    this.nodes.push(assignment)
                    return { consumer: assignment }
                },
                bareword_instanceof: () => {
                    const test = new ParserInstanceof(this.nodes.pop())
                    this.nodes.push(test)
                    return { consumer: test }
                },
                ampersand: c => {
                    const assignment = new this.handlerClasses.BitOperator(c, this.nodes.pop())
                    this.nodes.push(assignment)
                    return { consumer: assignment }
                },
                bitOperator: c => {
                    const assignment = new this.handlerClasses.BitOperator(c, this.nodes.pop())
                    this.nodes.push(assignment)
                    return { consumer: assignment }
                },
                booleanOperator: c => {
                    const assignment = new this.handlerClasses.BooleanOperator(c, this.nodes.pop())
                    this.nodes.push(assignment)
                    return { consumer: assignment }
                },
                dot: () => {
                    const concatenation = new this.handlerClasses.StringConcatenation(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                doubleQuestionMark: () => {
                    const c = new this.handlerClasses.CoalesceOperator(this.nodes.pop())
                    this.nodes.push(c)
                    return {consumer: c}
                },
                doubleColon: () => {
                    const concatenation = new ParserClassValueReference(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                inPlaceConcatenation: () => {
                    const concatenation = new this.handlerClasses.StringConcatenation(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                inPlaceMathsOperator: c => {
                    const numberExpression = new this.handlerClasses.NumberExpression(
                        this.nodes.pop(),
                        c
                    )
                    this.nodes.push(numberExpression)
                    return { consumer: numberExpression }
                },
                mathsOperator: c => {
                    const numberExpression = new this.handlerClasses.NumberExpression(
                        this.nodes.pop(),
                        c
                    )
                    this.nodes.push(numberExpression)
                    return { consumer: numberExpression }
                },
                space: () => { },
                unaryMathsOperator: c => {
                    const numberExpression = new this.handlerClasses.NumberExpression(
                        this.nodes.pop(),
                        c
                    )
                    this.nodes.push(numberExpression)
                    return { consumer: numberExpression }
                },
            },
            postBracket: {
                closeBracket: () => ({mode: "postArgument"}),
                space: () => {},
            },
        }
    }
}

export class ParserExpression extends ParserStaticExpression {
    constructor() {
        super()
        this.isStaticDeclaration = false
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     * @param {boolean} allow_empty If true, an initial ), } or ; will make this
     * return in reconsume mode
     * @returns {ParserBase["modes"]["initial"]}
     */
    static expressionParser(f, next_mode, allow_empty = false) {
        const handle_expression = this.handleExpression(f, next_mode)
        const parser = super.expressionParser(f, next_mode)
        const dynamic_tokens = [
            "at",
            "bareword",
            "bareword_include",
            "bareword_include_once",
            "bareword_list",
            "bareword_new",
            "bareword_require",
            "bareword_require_once",
            "bareword_static",
            "varname",
        ]
        for(const t of dynamic_tokens) {
            parser[t] = handle_expression
        }
        if(allow_empty) {
            return {
                ...this.endOfExpressionParser(next_mode),
                ...parser
            }
        } else {
            return parser
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
            return {consumer: php, mode: next_mode, reconsumeLast: 1}
        }
    }
    get handlerClasses() {
        return {
            Array: ParserArray,
            BitOperator: ParserBitOperator,
            BooleanOperator: ParserBooleanOperator,
            CoalesceOperator: ParserCoalesceOperator,
            Expression: ParserExpression,
            NumberExpression: ParserNumberExpression,
            OldArray: ParserOldArray,
            StringConcatenation: ParserStringConcatenation,
            TemplateString: ParserTemplateString,
        }
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const static_modes = super.modes
        return {
            ...static_modes,
            castOrGroup: {
                ...ParserExpression.expressionParser(
                    php => this.nodes.push(php),
                    "postBracket"
                ),
                bareword_array: c => {
                    this.castTo = c
                    return {mode: "postCast"}
                },
                bareword_bool: c => {
                    this.castTo = c
                    return {mode: "postCast"}
                },
                bareword_float: c => {
                    this.castTo = c
                    return {mode: "postCast"}
                },
                bareword_int: c => {
                    this.castTo = c
                    return {mode: "postCast"}
                },
                bareword_object: c => {
                    this.castTo = c
                    return {mode: "postCast"}
                },
                bareword_string: c => {
                    this.castTo = c
                    return {mode: "postCast"}
                },
            },
            initial: {
                ...static_modes.initial,
                at: c => {
                    this.silentErrors = true
                    return {}
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
                bareword_list: () => {
                    const php = new ParserListAssignment()
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
                bareword_static: () => ({mode: "staticSymbolOrRef"}),
                minusminus: () => {
                    const numberExpression = new ParserPreIncrement(-1)
                    this.nodes.push(numberExpression)
                    return {consumer: numberExpression, mode: "postArgument"}
                },
                openBracket: () => ({mode: "castOrGroup"}),
                plusplus: () => {
                    const numberExpression = new ParserPreIncrement(1)
                    this.nodes.push(numberExpression)
                    return {consumer: numberExpression, mode: "postArgument"}
                },
                varname: c => {
                    this.nodes.push(new ParserVariable(c))
                    return { mode: "postArgument" }
                },
            },
            staticSymbolOrRef: {
                bareword_function: () => {
                    const php = new ParserStaticClosure()
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                doubleColon: () => {
                    const php = new ParserConstant("static")
                    this.nodes.push(php)
                    return {mode: "postArgument", reconsumeLast: 1}
                },
                space: () => {},
            },
            postArgument: {
                arrow: () => {
                    const concatenation = new ParserPropertyReference(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                equals: () => {
                    const assignment = new ParserAssignment(this.nodes.pop())
                    this.nodes.push(assignment)
                    return { consumer: assignment }
                },
                minusminus: () => {
                    const numberExpression = new ParserIncrement(
                        this.nodes.pop(),
                        -1
                    )
                    this.nodes.push(numberExpression)
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
                plusplus: () => {
                    const numberExpression = new ParserIncrement(
                        this.nodes.pop(),
                        1
                    )
                    this.nodes.push(numberExpression)
                },
                questionMark: () => {
                    const n = new ParserTernary(this.nodes.pop())
                    this.nodes.push(n)
                    return {consumer: n}
                },
                ...static_modes.postArgument,
                ...ParserComparison.expressionParser(() => this.nodes.pop(), p => this.nodes.push(p))
            },
            postCast: {
                closeBracket: () => ({mode: "initial"}),
                space: () => {},
            },
        }
    }
}
