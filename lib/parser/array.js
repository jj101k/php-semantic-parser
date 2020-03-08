import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression, ParserReference } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserStaticArray extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get expressionClass() {
        return ParserStaticExpression
    }
    get modes() {
        const initial = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, "next")
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                "postLeft",
                true
            ).handlers,
        })
        const later = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, "next")
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                "postLeft",
                true
            ).handlers
        })
        const next = new ParserStateHandler({
            closeSquare: () => ParserStateChange.mode("end"),
            comma: () => ParserStateChange.mode("later"),
        })
        const postLeft = new ParserStateHandler({
            closeSquare: () => ParserStateChange.mode("end"),
            fatArrow: () => ParserStateChange.mode("right"),
            comma: () => ParserStateChange.mode("later"),
        })
        const right = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, "next")
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ).handlers
        })
        return {initial, later, next, postLeft, right}
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
        const initial = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, "next")
            },
            closeBracket: () => ParserStateChange.mode("end"),
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                "postLeft"
            ).handlers
        })
        const later = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, "next")
            },
            closeBracket: () => ParserStateChange.mode("end"),
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                "postLeft"
            ).handlers,
        })
        const next = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode("end"),
            comma: () => ParserStateChange.mode("later"),
        })
        const postLeft = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode("end"),
            fatArrow: () => ParserStateChange.mode("right"),
            comma: () => ParserStateChange.mode("later"),
        })
        const right = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, "next")
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ).handlers
        })
        return {initial, later, next, postLeft, right}
    }
}

export class ParserOldArray extends ParserStaticOldArray {
    get expressionClass() {
        return ParserExpression
    }
}
