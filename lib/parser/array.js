import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression, ParserReference } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserStaticArray extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get closeSymbol() {
        return "closeSquare"
    }
    get initialMode() {
        const postLeft = new ParserStateHandler({
            [this.closeSymbol]: () => ParserStateChange.end,
            fatArrow: () => ParserStateChange.mode(right),
            comma: () => ParserStateChange.mode(later),
        })
        const ampersand = () => {
            const r = new ParserReference()
            this.nodes.push(r)
            return new ParserStateChange(r, next)
        }
        const left_expression_handlers = ParserStaticExpression.expressionParser(
            php => this.nodes.push(php),
            postLeft
        ).handlers
        const later = new ParserStateHandler({
            ampersand,
            [this.closeSymbol]: () => ParserStateChange.end,
            ...left_expression_handlers
        })
        const next = new ParserStateHandler({
            closeSquare: () => ParserStateChange.end,
            comma: () => ParserStateChange.mode(later),
        })
        const right = new ParserStateHandler({
            ampersand,
            ...ParserStaticExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                next
            ).handlers
        })
        return new ParserStateHandler({
            ampersand,
            [this.closeSymbol]: () => ParserStateChange.end,
            ...left_expression_handlers,
        })
    }
}
export class ParserArray extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get closeSymbol() {
        return "closeSquare"
    }
    get initialMode() {
        const postLeft = new ParserStateHandler({
            [this.closeSymbol]: () => ParserStateChange.end,
            fatArrow: () => ParserStateChange.mode(right),
            comma: () => ParserStateChange.mode(later),
        })
        const left_expression_handlers = ParserExpression.expressionParser(
            php => this.nodes.push(php),
            postLeft
        ).handlers
        const ampersand = () => {
            const r = new ParserReference()
            this.nodes.push(r)
            return new ParserStateChange(r, next)
        }
        const later = new ParserStateHandler({
            ampersand,
            [this.closeSymbol]: () => ParserStateChange.end,
            ...left_expression_handlers
        })
        const next = new ParserStateHandler({
            [this.closeSymbol]: () => ParserStateChange.end,
            comma: () => ParserStateChange.mode(later),
        })
        const right = new ParserStateHandler({
            ampersand,
            ...ParserExpression.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                next
            ).handlers
        })
        return new ParserStateHandler({
            ampersand,
            [this.closeSymbol]: () => ParserStateChange.end,
            ...left_expression_handlers
        })
    }
}

export class ParserStaticOldArray extends ParserStaticArray {
    get closeSymbol() {
        return "closeBracket"
    }
}

export class ParserOldArray extends ParserArray {
    get closeSymbol() {
        return "closeBracket"
    }
}
