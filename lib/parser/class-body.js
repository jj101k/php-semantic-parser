import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserAbstractFunction, ParserFunction } from "./function"
import { ParserVariable } from "./variable"
import { ParserUseTrait } from "./use-trait"
import { ParserStateChange } from "../parser-state-change"

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
                    return ParserStateChange.mode("postVariable")
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
                    return new ParserStateChange(php, "end")
                },
                bareword_const: () => ParserStateChange.mode("constName"),
                bareword_private: () => {this.visibility = "private"},
                bareword_protected: () => {this.visibility = "protected"},
                bareword_public: () => {this.visibility = "public"},
                bareword_static: () => {this.isStatic = true},
                bareword_var: () => {this.visibility = "public"}, // PHP4
                space: () => {},
                varname: c => {
                    this.values.push(new ParserVariable(c))
                    return ParserStateChange.mode("postVariable")
                },
            },
            initialValue: ParserStaticExpression.expressionParser(php => this.valueValues.push(php), "postValue"),
            nextVariable: {
                space: () => {},
                varname: c => {
                    this.values.push(new ParserVariable(c))
                    return ParserStateChange.mode("postVariable")
                },
            },
            postValue: {
                comma: () => ParserStateChange.mode("nextVariable"),
                semicolon: () => this.end,
                space: () => {},
            },
            postVariable: {
                comma: () => ParserStateChange.mode("nextVariable"),
                equals: () => ParserStateChange.mode("initialValue"),
                semicolon: () => this.end,
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
                    return new ParserStateChange(php, null, 1)
                },
                bareword_use: () => {
                    const ut = new ParserUseTrait()
                    this.nodes.push(ut)
                    return new ParserStateChange(ut)
                },
                closeCurly: () => ParserStateChange.mode("end"),
            },
        }
    }
}
