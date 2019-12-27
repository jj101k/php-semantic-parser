import { ParserBase } from "./base"
import { ParserFunctionArgument } from "./function-argument"
import { ParserComment } from "./comment"
export class ParserFunctionArgumentList extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const handle_item = () => {
            const arg = new ParserFunctionArgument()
            this.nodes.push(arg)
            return {
                consumer: arg,
                mode: "next",
                reconsumeLast: 1,
            }
        }
        const ellipsis = () => {
            const arg = new ParserFunctionArgument()
            arg.isRest = true
            this.nodes.push(arg)
            return {
                consumer: arg,
                mode: "afterLast",
            }
        }
        const comment = () => {
            const php = new ParserComment()
            this.nodes.push(php)
            return {consumer: php}
        }
        return {
            afterLast: {
                closeBracket: () => ({mode: "end"}),
            },
            initial: {
                ampersand: handle_item,
                bareword: handle_item,
                closeBracket: () => ({mode: "end"}),
                comment,
                ellipsis,
                questionMark: handle_item,
                space: () => {},
                varname: handle_item,
            },
            later: {
                ampersand: handle_item,
                bareword: handle_item,
                comment,
                questionMark: handle_item,
                space: () => {},
                varname: handle_item,
            },
            next: {
                closeBracket: () => ({mode: "end"}),
                comma: () => ({mode: "later"}),
            },
        }
    }
}
