import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { Token } from "../lex"

export class ParserComparison extends ParserBase {
    /**
     *
     * @param {(t: Token, n: string) => ParserBase} pop
     * @param {(p: ParserBase) => *} push
     */
    static expressionParser(pop, push) {
        /**
         *
         * @param {string} c
         * @param {Token} t
         * @param {string} n
         */
        const handle_comparison = (c, t, n) => {
            const php = new ParserComparison(pop(t, n), c)
            push(php)
            return new ParserStateChange(php)
        }
        return {
            equals2: handle_comparison,
            equals3: handle_comparison,
            greaterEquals: handle_comparison,
            greaterThan: handle_comparison,
            lessEquals: handle_comparison,
            lessThan: handle_comparison,
            notEquals2: handle_comparison,
            notEquals3: handle_comparison,
            spaceship: handle_comparison, // @todo note different return
        }
    }
    /**
     *
     * @param {ParserBase} left
     * @param {string} operator
     */
    constructor(left, operator) {
        super()
        this.operator = operator
        this.left = left
    }
    get initialMode() {
        return ParserExpression.expressionParser(
            php => this.right = php
        )
    }
}
