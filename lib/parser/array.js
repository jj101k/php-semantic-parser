import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression, ParserReference } from "./expression"

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
                    return {consumer: r, mode: "next"}
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
                    return {consumer: r, mode: "next"}
                },
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                )
            },
            next: {
                closeSquare: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
            postLeft: {
                closeSquare: () => ({ mode: "end" }),
                fatArrow: () => ({mode: "right"}),
                comma: () => ({ mode: "later" }),
            },
            right: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return {consumer: r, mode: "next"}
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
                    return {consumer: r, mode: "next"}
                },
                closeBracket: () => ({ mode: "end" }),
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            },
            later: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return {consumer: r, mode: "next"}
                },
                closeBracket: () => ({ mode: "end" }),
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                ),
            },
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
            postLeft: {
                closeBracket: () => ({ mode: "end" }),
                fatArrow: () => ({mode: "right"}),
                comma: () => ({ mode: "later" }),
            },
            right: {
                ampersand: () => {
                    const r = new ParserReference()
                    this.nodes.push(r)
                    return {consumer: r, mode: "next"}
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
