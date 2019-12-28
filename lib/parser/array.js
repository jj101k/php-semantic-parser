import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression } from "./expression"
import { ParserVariablePBR } from "./variable"

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
            byRef: {
                varname: c => {
                    const v = new ParserVariablePBR(c)
                    this.nodes.push(v)
                    return {mode: "next"}
                },
            },
            initial: {
                ampersand: () => ({mode: "byRef"}),
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft",
                    true
                ),
            },
            later: {
                ampersand: () => ({mode: "byRef"}),
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
            right: this.expressionClass.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ),
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
            byRef: {
                varname: c => {
                    const v = new ParserVariablePBR(c)
                    this.nodes.push(v)
                    return {mode: "next"}
                },
            },
            initial: {
                ampersand: () => ({mode: "byRef"}),
                closeBracket: () => ({ mode: "end" }),
                ...this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            },
            later: {
                ampersand: () => ({mode: "byRef"}),
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
            right: this.expressionClass.expressionParser(
                php => this.nodes.push([this.nodes.pop(), php]),
                "next"
            ),
        }
    }
}

export class ParserOldArray extends ParserStaticOldArray {
    get expressionClass() {
        return ParserExpression
    }
}
