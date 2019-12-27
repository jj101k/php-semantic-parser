import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserAbstractFunction } from "./function"
import { ParserInlineComment } from "./inline-comment"
import { ParserStaticExpression } from "./expression"
class ParserInterfaceSymbol extends ParserBase {
    get modes() {
        const bareword_function = () => {
            const php = new ParserAbstractFunction()
            this.value = php
            return {consumer: php, mode: "end"}
        }
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
                bareword_function,
                bareword_private: () => {
                    this.visibility = "private"
                    return {mode: "scopeOrName"}
                },
                bareword_protected: () => {
                    this.visibility = "protected"
                    return {mode: "scopeOrName"}
                },
                bareword_public: () => {
                    this.visibility = "public"
                    return {mode: "scopeOrName"}
                },
                bareword_static: c => {
                    this.isStatic = true
                    return {mode: "visibilityOrName"}
                },
            },
            initialValue: ParserStaticExpression.expressionParser(php => this.valueValue = php, "postValue"),
            name: {
                bareword_function,
                space: () => {},
            },
            postValue: {
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
            postVariable: {
                equals: () => ({mode: "initialValue"}),
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
            scopeOrName: {
                bareword_function,
                bareword_static: () => {
                    this.isStatic = true
                    return {mode: "name"}
                },
                space: () => {},
            },
            visibilityOrName: {
                bareword_function,
                bareword_private: () => {
                    this.visibility = "private"
                    return {mode: "name"}
                },
                bareword_protected: () => {
                    this.visibility = "protected"
                    return {mode: "name"}
                },
                bareword_public: () => {
                    this.visibility = "public"
                    return {mode: "name"}
                },
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
                bareword: c => {
                    const php = new ParserInterfaceSymbol()
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
