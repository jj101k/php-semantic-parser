import { ParserBase } from "./base"
import { ParserTemplateString } from "./template-string"
import { ParserArray } from "./array"
import { ParserBoolean } from "./boolean"
import { ParserNull } from "./null"
export class ParserFunctionArgument extends ParserBase {
    get modes() {
        return {
            defaultValue: {
                bareword_array: () => ({mode: "maybeArray"}),
                bareword_false: () => {
                    const php = new ParserBoolean(false)
                    this.defaultValue = php
                    return {mode: "end"}
                },
                bareword_null: () => {
                    const php = new ParserNull()
                    this.defaultValue = php
                    return {mode: "end"}
                },
                bareword_true: () => {
                    const php = new ParserBoolean(true)
                    this.defaultValue = php
                    return {mode: "end"}
                },
                openSquare: () => {
                    const php = new ParserArray(false)
                    this.defaultValue = php
                    return { consumer: php, mode: "end" }
                },
                quoteDouble: () => {
                    const php = new ParserTemplateString(false)
                    this.defaultValue = php
                    return { consumer: php, mode: "end" }
                },
                space: () => {},
            },
            initial: {
                bareword: c => {
                    this.type = c
                    return { mode: "name" }
                },
                varname: c => {
                    this.name = c
                    return { mode: "postValue" }
                },
            },
            name: {
                space: () => { },
                varname: c => {
                    this.name = c
                    return { mode: "postValue" }
                },
            },
            postValue: {
                closeBracket: () => ({mode: "end", reconsume: true}),
                comma: () => ({mode: "end", reconsume: true}),
                equals: () => ({mode: "defaultValue"}),
                space: () => { },
            },
        }
    }
}
