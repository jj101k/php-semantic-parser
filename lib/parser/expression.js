import { ParserArray, ParserOldArray, ParserStaticArray, ParserStaticOldArray } from "./array"
import { ParserArrayMemberRef, ParserCurlyArrayMemberRef } from "./array-member-ref"
import { ParserAssignment } from "./assignment"
import { ParserBase } from "./base"
import { ParserBoolean } from "./boolean"
import { ParserBitOperator, ParserBooleanOperator as ParserBooleanOperator, ParserCoalesceOperator, ParserStaticBitOperator, ParserStaticBooleanOperator, ParserStaticCoalesceOperator } from "./boolean-operator"
import { ParserClassValueReference } from "./class-value-reference"
import { ParserClone } from "./clone"
import { ParserClosure, ParserStaticClosure } from "./closure"
import { ParserComparison } from "./comparison"
import { ParserConstant } from "./constant"
import { ParserFunctionCall } from "./function-call"
import { ParserInclude } from "./include"
import { ParserIncrement, ParserPreIncrement } from "./increment"
import { ParserInstanceof } from "./instanceof"
import { ParserListAssignment } from "./list-assignment"
import { ParserNew } from "./new"
import { ParserNull } from "./null"
import { ParserNumber } from "./number"
import { ParserNumberExpression, ParserStaticNumberExpression } from "./number-expression"
import { ParserPropertyReference } from "./property-reference"
import { ParserSimpleString } from "./simple-string"
import { ParserStaticStringConcatenation, ParserStringConcatenation } from "./string-concatenation"
import { ParserStaticTemplateString, ParserTemplateString, ParserBackquoteString } from "./template-string"
import { ParserTernary } from "./ternary"
import { ParserVariable, ParserAliasedVariable } from "./variable"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"
import { Token } from "../lex"

export class ParserStaticExpression extends ParserBase {
    static get initialTokens() {
        return [
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
            "quoteBack",
            "quoteDouble",
            "quoteSingle",
            "unaryMathsOperator",
        ]
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {ParserStateHandler} next_mode
     * @param {boolean} allow_empty If true, an initial ), } or ; will make this
     * return in reconsume mode
     * @returns {ParserBase["initialMode"]}
     */
    static expressionParser(f, next_mode = new ParserStateHandlerEnd(), allow_empty = false) {
        const handle_expression = this.handleExpression(f, next_mode)
        const parser = ParserBase.commentOrSpace(() => {})
        for(const t of this.initialTokens) {
            parser[t] = handle_expression
        }

        if(allow_empty) {
            return new ParserStateHandler({
                ...this.endOfExpressionParser(null, next_mode),
                ...parser
            })
        } else {
            return new ParserStateHandler(parser)
        }
    }
    /**
     * Returns a parser for things which, if they appear at the start of an
     * expression or a possible end point, end it and (generally) pass back up.
     *
     * @param {?(t: Token, n: string) => *} on_end
     * @param {ParserStateHandler} next_mode
     * @returns {ParserBase["initialMode"]["handlers"]}
     */
    static endOfExpressionParser(
        on_end = null,
        next_mode = new ParserStateHandlerEnd(),
    ) {
        /**
         *
         * @param {string} c
         * @param {Token} t
         * @param {string} n
         */
        const handler = (c, t, n) => {
            if(on_end) on_end(t, n)
            return new ParserStateChange(null, next_mode, 1)
        }
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
     * @param {ParserStateHandler} next_mode
     */
    static handleExpression(f, next_mode) {
        return () => {
            const php = new ParserStaticExpression()
            f(php)
            return new ParserStateChange(php, next_mode, 1)
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
    get initialMode() {
        const binary_boolean_operator = c => {
            const assignment = new this.handlerClasses.BooleanOperator(c, this.nodes.pop())
            this.nodes.push(assignment)
            return new ParserStateChange(assignment)
        }
        const maybeArray = new ParserStateHandler({
            openBracket: () => {
                const php = new this.handlerClasses.OldArray()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            space: () => {},
        })
        const postArgument = new ParserStateHandler({
            ...this.commentOrSpace,
            ...ParserExpression.endOfExpressionParser(),
            bareword: () => new ParserStateChange(null, new ParserStateHandlerEnd(), 1),
            bareword_and: binary_boolean_operator,
            bareword_instanceof: () => {
                const test = new ParserInstanceof(this.nodes.pop())
                this.nodes.push(test)
                return new ParserStateChange(test)
            },
            bareword_or: binary_boolean_operator,
            bareword_xor: binary_boolean_operator,
            ampersand: c => {
                const assignment = new this.handlerClasses.BitOperator(c, this.nodes.pop())
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            bitOperator: c => {
                const assignment = new this.handlerClasses.BitOperator(c, this.nodes.pop())
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            booleanOperator: c => {
                const assignment = new this.handlerClasses.BooleanOperator(c, this.nodes.pop())
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            dot: () => {
                const concatenation = new this.handlerClasses.StringConcatenation(this.nodes.pop())
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            doubleQuestionMark: () => {
                const c = new this.handlerClasses.CoalesceOperator(this.nodes.pop())
                this.nodes.push(c)
                return new ParserStateChange(c)
            },
            doubleColon: () => {
                const concatenation = new ParserClassValueReference(this.nodes.pop())
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            inPlaceConcatenation: () => {
                const concatenation = new this.handlerClasses.StringConcatenation(this.nodes.pop())
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            inPlaceBitOperator: c => {
                const assignment = new this.handlerClasses.BitOperator(c, this.nodes.pop())
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            inPlaceMathsOperator: c => {
                const numberExpression = new this.handlerClasses.NumberExpression(
                    this.nodes.pop(),
                    c
                )
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression)
            },
            mathsOperator: c => {
                const numberExpression = new this.handlerClasses.NumberExpression(
                    this.nodes.pop(),
                    c
                )
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression)
            },
            space: () => { },
            unaryMathsOperator: c => {
                const numberExpression = new this.handlerClasses.NumberExpression(
                    this.nodes.pop(),
                    c
                )
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression)
            },
        })
        const postBracket = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(postArgument),
            space: () => {},
        })
        return new ParserStateHandler({
            bareword: c => {
                const php = new ParserConstant(c)
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            bareword_array: () => ParserStateChange.mode(maybeArray),
            bareword_clone: () => {
                const php = new ParserClone()
                this.nodes.push(php)
                return new ParserStateChange(php, new ParserStateHandlerEnd())
            },
            bareword_false: () => {
                const php = new ParserBoolean(false)
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            bareword_function: () => {
                const php = new ParserClosure()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_null: () => {
                const php = new ParserNull()
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            bareword_true: () => {
                const php = new ParserBoolean(true)
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            heredoc: () => {
                const php = new this.handlerClasses.TemplateString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            not: () => {
                // Unary on the left is a bit complicated but ok if it can
                // be chained back up
                this.not = true
                const expression = new this.handlerClasses.Expression()
                this.nodes.push(expression)
                return new ParserStateChange(expression, new ParserStateHandlerEnd())
            },
            nowdoc: () => {
                const php = new ParserSimpleString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            number: c => {
                const n = new ParserNumber(c)
                this.nodes.push(n)
                return ParserStateChange.mode(postArgument)
            },
            openBracket: () => {
                const expression = new this.handlerClasses.Expression()
                this.nodes.push(expression)
                return new ParserStateChange(expression, postBracket)
            },
            openSquare: () => {
                const php = new this.handlerClasses.Array()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            quoteDouble: () => {
                const php = new this.handlerClasses.TemplateString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            quoteSingle: () => {
                const php = new ParserSimpleString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            space: () => {},
            unaryMathsOperator: c => {
                this.multiplier = (c == "-") ? -1 : 1
            },
        })
    }
}

export class ParserExpression extends ParserStaticExpression {
    static get initialTokens() {
        return [
            ...super.initialTokens,
            "aliasedVarname",
            "aliasedVarnameStart",
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
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {ParserStateHandler} next_mode
     */
    static handleExpression(f, next_mode) {
        return () => {
            const php = new ParserExpression()
            f(php)
            return new ParserStateChange(php, next_mode, 1)
        }
    }
    constructor() {
        super()
        this.isStaticDeclaration = false
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
    get initialMode() {
        const binary_boolean_operator = (c, t, n) => {
            const assignment = new this.handlerClasses.BooleanOperator(c, this.popNodeForRead(t, n))
            this.nodes.push(assignment)
            return new ParserStateChange(assignment)
        }
        const maybeArray = new ParserStateHandler({
            openBracket: () => {
                const php = new this.handlerClasses.OldArray()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            space: () => {},
        })
        const postBracket = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(postArgument),
            space: () => {},
        })

        const cast_types = [
            "array",
            "bool",
            "boolean", // This actually works
            "double", // As float
            "float",
            "int",
            "integer", // as does this
            "object",
            "real", // As float
            "string",
            "unset", // Actually casts to null!
        ]
        const casts = {}
        for(const type of cast_types) {
            casts[`bareword_${type}`] = c => {
                this.castTo = c
                return ParserStateChange.mode(postCast)
            }
        }

        const castOrGroup = new ParserStateHandler({
            ...ParserExpression.expressionParser(
                php => this.nodes.push(php),
                postBracket
            ).handlers,
            ...casts,
            bareword_array: () => ParserStateChange.mode(maybeOldArray),
        })
        const maybeOldArray = new ParserStateHandler({
            closeBracket: () => {
                this.castTo = "array"
                return ParserStateChange.mode(initial)
            },
            openBracket: () => {
                const php = new ParserOldArray()
                this.nodes.push(php)
                return new ParserStateChange(php, postBracket)
            },
            space: () => {},
        })
        const postArgument = new ParserStateHandler({
            ...this.commentOrSpace,
            ...ParserExpression.endOfExpressionParser(
                (t, n) => {
                    if(this.nodes.length) {
                        const last = this.nodes[this.nodes.length - 1]
                        if(last instanceof ParserVariable && !this.namespace.has(last.name)) {
                            console.warn(`${n}:${t.position} Variable ${last.name} is used before it's defined`)
                        }
                    }
                }
            ),

            arrow: (c, t, n) => {
                const concatenation = new ParserPropertyReference(this.popNodeForRead(t, n))
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            equals: () => {
                const assignment = new ParserAssignment(this.nodes.pop())
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            minusminus: (c, t, n) => {
                const numberExpression = new ParserIncrement(
                    this.popNodeForRead(t, n),
                    -1
                )
                this.nodes.push(numberExpression)
            },
            openBracket: (c, t, filename) => {
                const n = new ParserFunctionCall(this.popNodeForRead(t, filename))
                this.nodes.push(n)
                return new ParserStateChange(n)
            },
            openCurly: (c, t, filename) => {
                console.warn("Use of curlies for array indices (eg. $foo{\"bar\"}) is deprecated")
                const n = new ParserCurlyArrayMemberRef(this.popNodeForRead(t, filename))
                this.nodes.push(n)
                return new ParserStateChange(n)
            },
            openSquare: (c, t, filename) => {
                const n = new ParserArrayMemberRef(this.popNodeForRead(t, filename))
                this.nodes.push(n)
                return new ParserStateChange(n)
            },
            plusplus: (c, t, n) => {
                const numberExpression = new ParserIncrement(
                    this.popNodeForRead(t, n),
                    1
                )
                this.nodes.push(numberExpression)
            },
            questionMark: (c, t, filename) => {
                const n = new ParserTernary(this.popNodeForRead(t, filename))
                this.nodes.push(n)
                return new ParserStateChange(n)
            },

            bareword: () => new ParserStateChange(null, new ParserStateHandlerEnd(), 1),
            bareword_and: binary_boolean_operator,
            bareword_instanceof: (c, t, n) => {
                const test = new ParserInstanceof(this.popNodeForRead(t, n))
                this.nodes.push(test)
                return new ParserStateChange(test)
            },
            bareword_or: binary_boolean_operator,
            bareword_xor: binary_boolean_operator,
            ampersand: (c, t, n) => {
                const assignment = new this.handlerClasses.BitOperator(c, this.popNodeForRead(t, n))
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            bitOperator: (c, t, n) => {
                const assignment = new this.handlerClasses.BitOperator(c, this.popNodeForRead(t, n))
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            booleanOperator: (c, t, n) => {
                const assignment = new this.handlerClasses.BooleanOperator(c, this.popNodeForRead(t, n))
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            dot: (c, t, n) => {
                const concatenation = new this.handlerClasses.StringConcatenation(this.popNodeForRead(t, n))
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            doubleQuestionMark: (x, t, n) => {
                const c = new this.handlerClasses.CoalesceOperator(this.popNodeForRead(t, n))
                this.nodes.push(c)
                return new ParserStateChange(c)
            },
            doubleColon: (c, t, n) => {
                const concatenation = new ParserClassValueReference(this.popNodeForRead(t, n))
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            inPlaceConcatenation: (c, t, n) => {
                const concatenation = new this.handlerClasses.StringConcatenation(this.popNodeForRead(t, n))
                this.nodes.push(concatenation)
                return new ParserStateChange(concatenation)
            },
            inPlaceBitOperator: (c, t, n) => {
                const assignment = new this.handlerClasses.BitOperator(c, this.popNodeForRead(t, n))
                this.nodes.push(assignment)
                return new ParserStateChange(assignment)
            },
            inPlaceMathsOperator: (c, t, n) => {
                const numberExpression = new this.handlerClasses.NumberExpression(
                    this.popNodeForRead(t, n),
                    c
                )
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression)
            },
            mathsOperator: (c, t, n) => {
                const numberExpression = new this.handlerClasses.NumberExpression(
                    this.popNodeForRead(t, n),
                    c
                )
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression)
            },
            space: () => { },
            unaryMathsOperator: (c, t, n) => {
                const numberExpression = new this.handlerClasses.NumberExpression(
                    this.popNodeForRead(t, n),
                    c
                )
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression)
            },
            ...ParserComparison.expressionParser((t, n) => this.popNodeForRead(t, n), p => this.nodes.push(p)),
            $pop: () => this.nope, // for template strings
        })
        const postCast = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(initial),
            space: () => {},
        })
        const staticSymbolOrRef = new ParserStateHandler({
            bareword_function: () => {
                const php = new ParserStaticClosure()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            doubleColon: () => {
                const php = new ParserConstant("static")
                this.nodes.push(php)
                return new ParserStateChange(null, postArgument, 1)
            },
            space: () => {},
            $else: () => {
                const php = new ParserConstant("static")
                this.nodes.push(php)
                return this.nope
            }
        })

        const initial = new ParserStateHandler({
            bareword: c => {
                const php = new ParserConstant(c)
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            bareword_array: () => ParserStateChange.mode(maybeArray),
            bareword_clone: () => {
                const php = new ParserClone()
                this.nodes.push(php)
                return new ParserStateChange(php, new ParserStateHandlerEnd())
            },
            bareword_false: () => {
                const php = new ParserBoolean(false)
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            bareword_function: () => {
                const php = new ParserClosure()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_null: () => {
                const php = new ParserNull()
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            bareword_true: () => {
                const php = new ParserBoolean(true)
                this.nodes.push(php)
                return ParserStateChange.mode(postArgument)
            },
            heredoc: () => {
                const php = new this.handlerClasses.TemplateString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            not: () => {
                // Unary on the left is a bit complicated but ok if it can
                // be chained back up
                this.not = true
                const expression = new this.handlerClasses.Expression()
                this.nodes.push(expression)
                return new ParserStateChange(expression, new ParserStateHandlerEnd())
            },
            nowdoc: () => {
                const php = new ParserSimpleString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            number: c => {
                const n = new ParserNumber(c)
                this.nodes.push(n)
                return ParserStateChange.mode(postArgument)
            },
            openSquare: () => {
                const php = new this.handlerClasses.Array()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            quoteDouble: () => {
                const php = new this.handlerClasses.TemplateString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            quoteSingle: () => {
                const php = new ParserSimpleString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            space: () => {},
            unaryMathsOperator: c => {
                this.multiplier = (c == "-") ? -1 : 1
            },


            aliasedVarname: c => {
                this.nodes.push(new ParserAliasedVariable(new ParserVariable(c.substring(1))))
                return ParserStateChange.mode(postArgument)
            },
            aliasedVarnameStart: () => {
                const av = new ParserAliasedVariable()
                this.nodes.push(av)
                return new ParserStateChange(av, postArgument)
            },
            at: c => {
                this.silentErrors = true
            },
            bareword_include: () => {
                const php = new ParserInclude(false)
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_include_once: () => {
                const php = new ParserInclude(false, true)
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_list: () => {
                const php = new ParserListAssignment()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_new: () => {
                const php = new ParserNew()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_require: () => {
                const php = new ParserInclude(true)
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_require_once: () => {
                const php = new ParserInclude(true, true)
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            bareword_static: () => ParserStateChange.mode(staticSymbolOrRef),
            interpolation: c => { // For string embedding
                this.nodes.push(new ParserVariable(c.substring(1)))
                return ParserStateChange.mode(postArgument)
            },
            minusminus: () => {
                const numberExpression = new ParserPreIncrement(-1)
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression, postArgument)
            },
            openBracket: () => ParserStateChange.mode(castOrGroup),
            plusplus: () => {
                const numberExpression = new ParserPreIncrement(1)
                this.nodes.push(numberExpression)
                return new ParserStateChange(numberExpression, postArgument)
            },
            quoteBack: () => {
                const php = new ParserBackquoteString()
                this.nodes.push(php)
                return new ParserStateChange(php, postArgument)
            },
            varname: c => {
                this.nodes.push(new ParserVariable(c))
                return ParserStateChange.mode(postArgument)
            },
        })

        return initial
    }

    /**
     * Pops the last node and warns if it was not defined
     *
     * @param {Token} t
     * @param {string} n
     */
    popNodeForRead(t, n) {
        const last = this.nodes.pop()
        if(last instanceof ParserVariable && !this.namespace.has(last.name)) {
            console.warn(`${n}:${t.position} Variable ${last.name} is used before it's defined`)
        }
        return last
    }
}

/**
 * A value somewhere already in memory which requires no computation - one which can follow "&"
 */
export class ParserReference extends ParserBase {
    /**
     *
     */
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        const postArgument = new ParserStateHandler({
            ...this.commentOrSpace,
            ...ParserExpression.endOfExpressionParser(),
            arrow: () => {
                const pr = new ParserPropertyReference(this.nodes.pop())
                this.nodes.push(pr)
                return new ParserStateChange(pr)
            },
            doubleColon: () => {
                const cvr = new ParserClassValueReference(this.nodes.pop())
                this.nodes.push(cvr)
                return new ParserStateChange(cvr)
            },
            openCurly: () => {
                console.warn("Use of curlies for array indices (eg. $foo{\"bar\"}) is deprecated")
                const n = new ParserArrayMemberRef(this.nodes.pop())
                this.nodes.push(n)
                return new ParserStateChange(n)
            },
            openSquare: () => {
                const n = new ParserArrayMemberRef(this.nodes.pop())
                this.nodes.push(n)
                return new ParserStateChange(n)
            },
            space: () => {},
        })
        return new ParserStateHandler({
            bareword: n => {
                const c = new ParserConstant(n)
                this.nodes.push(c)
                return ParserStateChange.mode(postArgument)
            },
            space: () => {},
            varname: c => {
                this.nodes.push(new ParserVariable(c))
                return ParserStateChange.mode(postArgument)
            },
        })
    }
}