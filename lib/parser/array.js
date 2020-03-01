import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression, ParserReference } from "./expression"
import { ParserStateChange } from "../parser-state-change"

export class ParserStaticArray extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get expressionClass() {
        return ParserStaticExpression
    }
    get modes() {
        return {
            initial: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return new ParserStateChange(r, "next")
                },
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                ),
            },
            later: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return new ParserStateChange(r, "next")
                },
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                )
            },
            next: {
                closeSquare: () => ParserStateChange.mode("end"),
                comma: () => ParserStateChange.mode("later"),
            },
            postLeft: {
                closeSquare: () => ParserStateChange.mode("end"),
                fatArrow: () => ParserStateChange.mode("right"),
                comma: () => ParserStateChange.mode("later"),
            },
            right: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return new ParserStateChange(r, "next")
                },
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push([this.nodes.pop(), php]),
                    "next"
                )
            },
        }
    }
}
export class ParserArray extends ParserStaticArray {
    get expressionClass() {
        return ParserExpression
    }
}

export class ParserStaticOldArray extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get expressionClass() {
        return ParserStaticExpression
    }
    get modes() {
        return {
            initial: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return new ParserStateChange(r, "next")
                },
                closeBracket: () => ParserStateChange.mode("end"),
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            },
            later: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return new ParserStateChange(r, "next")
                },
                closeBracket: () => ParserStateChange.mode("end"),
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                ),
            },
            next: {
                closeBracket: () => ParserStateChange.mode("end"),
                comma: () => ParserStateChange.mode("later"),
            },
            postLeft: {
                closeBracket: () => ParserStateChange.mode("end"),
                fatArrow: () => ParserStateChange.mode("right"),
                comma: () => ParserStateChange.mode("later"),
            },
            right: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return new ParserStateChange(r, "next")
                },
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push([this.nodes.pop(), php]),
                    "next"
                )
            },
        }
    }
}

export class ParserOldArray extends ParserStaticOldArray {
    get expressionClass() {
        return ParserExpression
    }
}
