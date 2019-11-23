import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression } from "./expression"
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
            initial: Object.assign(
                {
                    closeSquare: () => ({ mode: "end" }),
                },
                this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            later: Object.assign(
                {
                    closeSquare: () => ({ mode: "end" }),
                },
                this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
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
            initial: Object.assign(
                {
                    closeBracket: () => ({ mode: "end" }),
                },
                this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
            later: Object.assign(
                {
                    closeBracket: () => ({ mode: "end" }),
                },
                this.expressionClass.expressionParser(
                    php => this.nodes.push(php),
                    "postLeft"
                )
            ),
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
