import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserFunction } from "./function"
import { ParserVariable } from "./variable"
class ParserClassSymbol extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword: c => {
                    let php
                    if(c == "function") {
                        php = new ParserFunction()
                    } else if(["private", "protected", "public"].includes(c)) {
                        this.visibility = c
                        return {mode: "scopeOrName"}
                    } else if(c == "static") {
                        this.isStatic = true
                        return {mode: "visibilityOrName"}
                    } else {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            name: {
                bareword: c => {
                    let php
                    if(c == "function") {
                        php = new ParserFunction()
                    } else {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                space: () => {},
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            postVariable: {
                semicolon: () => ({mode: "end"}),
            },
            scopeOrName: {
                bareword: c => {
                    let php
                    if(c == "function") {
                        php = new ParserFunction()
                    } else if(c == "static") {
                        this.isStatic = true
                        return {mode: "name"}
                    } else {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.value = php
                    return {consumer: php, mode: "end"}
                },
                space: () => {},
                varname: c => {
                    this.value = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            visibilityOrName: {
                bareword: c => {
                    let php
                    if(c == "function") {
                        php = new ParserFunction()
                    } else if(["private", "protected", "public"].includes(c)) {
                        this.visibility = c
                        return {mode: "name"}
                    } else {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.value = php
                    return {consumer: php, mode: "end"}
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
                space: () => { },
            },
        }
    }
    startParse() {
        this.nodes = []
    }
}
