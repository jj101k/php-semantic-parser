import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserComparison extends ParserBase {
    /**
     *
     * @param {() => ParserBase} pop
     * @param {(p: ParserBase) => *} push
     */
    static expressionParser(pop, push) {
        const handle_comparison = c => {
            const php = new ParserComparison(pop(), c)
            push(php)
            return {consumer: php}
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
    get modes() {
        return {
            initial: ParserExpression.expressionParser(
                php => this.right = php,
                "end"
            ),
        }
    }
}
