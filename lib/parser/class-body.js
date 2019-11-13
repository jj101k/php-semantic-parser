import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserFunction } from "./function"
import { ParserVariable } from "./variable"
import { ParserTemplateString } from "./template-string"
import { ParserArray, ParserOldArray } from "./array"
import { ParserInlineComment } from "./inline-comment"
import { ParserBoolean } from "./boolean"
class ParserClassSymbol extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword_function: () => {
                    const php = new ParserFunction()
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
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            initialValue: { // Only a simple expression
                bareword_array: () => ({mode: "maybeArray"}),
                bareword_false: () => {
                    const php = new ParserBoolean(false)
                    this.valueValue = php
                    return {mode: "postValue"}
                },
                bareword_true: () => {
                    const php = new ParserBoolean(true)
                    this.valueValue = php
                    return {mode: "postValue"}
                },
                openSquare: () => {
                    const php = new ParserArray(true)
                    this.valueValue = php
                    return { consumer: php, mode: "postValue" }
                },
                quoteDouble: () => {
                    const php = new ParserTemplateString(true)
                    this.valueValue = php
                    return { consumer: php, mode: "postValue" }
                },
                space: () => {},
            },
            maybeArray: {
                openBracket: () => {
                    const php = new ParserOldArray(true)
                    this.valueValue = php
                    return { consumer: php, mode: "postValue" }
                },
                space: () => {},
            },
            name: {
                bareword_function: () => {
                    const php = new ParserFunction()
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                space: () => {},
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
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
                    const php = new ParserFunction()
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                bareword_static: () => {
                    this.isStatic = true
                    return {mode: "name"}
                },
                space: () => {},
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            visibilityOrName: {
                bareword_function: () => {
                    const php = new ParserFunction()
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
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
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
