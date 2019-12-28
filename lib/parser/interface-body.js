import { ParserBase } from "./base"
import { ParserAbstractFunction } from "./function"
import { ParserStaticExpression } from "./expression"
class ParserInterfaceSymbol extends ParserBase {
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
                bareword_const: () => ({mode: "constName"}),
                bareword_function: () => {
                    const php = new ParserAbstractFunction()
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                bareword_private: () => {this.visibility = "private"},
                bareword_protected: () => {this.visibility = "protected"},
                bareword_public: () => {this.visibility = "public"},
                bareword_static: () => {this.isStatic = true},
                space: () => {},
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
export class ParserInterfaceBody extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                ...this.commentOrSpace,
                bareword: c => {
                    const php = new ParserInterfaceSymbol()
                    this.nodes.push(php)
                    return {consumer: php, reconsumeLast: 1}
                },
                closeCurly: () => ({ mode: "end" }),
            },
        }
    }
}
