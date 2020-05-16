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
    get initialMode() {
        const postLeft = new ParserStateHandler({
            closeSquare: () => ParserStateChange.end,
            fatArrow: () => ParserStateChange.mode(right),
            comma: () => ParserStateChange.mode(later),
        })
        const later = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, next)
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                postLeft,
                true
            ).handlers
        })
        const next = new ParserStateHandler({
            closeSquare: () => ParserStateChange.end,
            comma: () => ParserStateChange.mode(later),
        })
        const right = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, next)
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                next
            ).handlers
        })
        return new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, next)
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                postLeft,
                true
            ).handlers,
        })
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
    get initialMode() {
        const postLeft = new ParserStateHandler({
            closeBracket: () => ParserStateChange.end,
            fatArrow: () => ParserStateChange.mode(right),
            comma: () => ParserStateChange.mode(later),
        })
        const later = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, next)
            },
            closeBracket: () => ParserStateChange.end,
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                postLeft
            ).handlers,
        })
        const next = new ParserStateHandler({
            closeBracket: () => ParserStateChange.end,
            comma: () => ParserStateChange.mode(later),
        })
        const right = new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, next)
            },
            ...this.expressionClass.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                next
            ).handlers
        })
        return new ParserStateHandler({
            ampersand: () => {
                const r = new ParserReference()
                this.nodes.push(r)
                return new ParserStateChange(r, next)
            },
            closeBracket: () => ParserStateChange.end,
            ...this.expressionClass.expressionParser(
                php => this.nodes.push(php),
                postLeft
            ).handlers
        })
    }
}

export class ParserOldArray extends ParserStaticOldArray {
    get expressionClass() {
        return ParserExpression
    }
}
