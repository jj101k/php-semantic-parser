import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserFunction } from "./function"
import { ParserInlineComment } from "./inline-comment"
import { ParserExpression } from "./expression"
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
                bareword_const: () => {
                    return {mode: "constName"}
                },
                bareword_function: () => {
                    const php = new ParserFunction(true)
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
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
            initialValue: ParserExpression.expressionParser(php => this.valueValue = php, "postValue", true),
            name: {
                bareword_function: () => {
                    const php = new ParserFunction(true)
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
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
                bareword_function: () => {
                    const php = new ParserFunction(true)
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                bareword_static: () => {
                    this.isStatic = true
                    return {mode: "name"}
                },
                space: () => {},
            },
            visibilityOrName: {
                bareword_function: () => {
                    const php = new ParserFunction(true)
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
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
                    return {consumer: php, reconsume: true}
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
