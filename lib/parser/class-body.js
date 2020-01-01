import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserAbstractFunction, ParserFunction } from "./function"
import { ParserVariable } from "./variable"
import { ParserUseTrait } from "./use-trait"

class ParserClassSymbol extends ParserBase {
    constructor() {
        super()
        this.isAbstract = null
        this.isFinal = null
        this.values = []
        this.valueValues = []
    }
    get modes() {
        return {
            constName: {
                bareword: c => {
                    this.constName = c
                    return {mode: "postVariable"}
                },
                space: () => {},
            },
            initial: {
                bareword_abstract: () => {this.isAbstract = true},
                bareword_final: () => {this.isFinal = true},
                bareword_function: () => {
                    const php = this.isAbstract ?
                        new ParserAbstractFunction() :
                        new ParserFunction()
                    this.values = [php]
                    return {consumer: php, mode: "end"}
                },
                bareword_const: () => ({mode: "constName"}),
                bareword_private: () => {this.visibility = "private"},
                bareword_protected: () => {this.visibility = "protected"},
                bareword_public: () => {this.visibility = "public"},
                bareword_static: () => {this.isStatic = true},
                space: () => {},
                varname: c => {
                    this.values.push(new ParserVariable(c))
                    return {mode: "postVariable"}
                },
            },
            initialValue: ParserStaticExpression.expressionParser(php => this.valueValues.push(php), "postValue"),
            nextVariable: {
                space: () => {},
                varname: c => {
                    this.values.push(new ParserVariable(c))
                    return {mode: "postVariable"}
                },
            },
            postValue: {
                comma: () => ({mode: "nextVariable"}),
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
            postVariable: {
                comma: () => ({mode: "nextVariable"}),
                equals: () => ({mode: "initialValue"}),
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
        }
    }
}
export class ParserClassBody extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                ...this.commentOrSpace,
                bareword: c => {
                    const php = new ParserClassSymbol()
                    this.nodes.push(php)
                    return {consumer: php, reconsumeLast: 1}
                },
                bareword_use: () => {
                    const ut = new ParserUseTrait()
                    this.nodes.push(ut)
                    return {consumer: ut}
                },
                closeCurly: () => ({ mode: "end" }),
            },
        }
    }
}
