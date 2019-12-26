import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserFunction } from "./function"
import { ParserVariable } from "./variable"
import { ParserInlineComment } from "./inline-comment"
import { ParserStaticExpression } from "./expression"
class ParserClassSymbol extends ParserBase {
    constructor() {
        super()
        this.isAbstract = null
        this.isFinal = null
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
                    const php = new ParserFunction(!!this.isAbstract)
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                bareword_const: () => ({mode: "constName"}),
                bareword_private: () => {this.visibility = "private"},
                bareword_protected: () => {this.visibility = "protected"},
                bareword_public: () => {this.visibility = "public"},
                bareword_static: () => {this.isStatic = true},
                space: () => {},
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            initialValue: ParserStaticExpression.expressionParser(php => this.valueValue = php, "postValue"),
            postValue: {
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
            postVariable: {
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
                bareword: c => {
                    const php = new ParserClassSymbol()
                    this.nodes.push(php)
                    return {consumer: php, reconsumeLast: 1}
                },
                closeCurly: () => ({ mode: "end" }),
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                inlineComment: () => {
                    const php = new ParserInlineComment()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                space: () => { },
            },
        }
    }
}
