import { ParserBase } from "./base"
import { ParserFunctionArgument } from "./function-argument"
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
        return {
            afterLast: {
                closeBracket: () => ({mode: "end"}),
            },
            initial: {
                ...this.commentOrSpace,
                ampersand: handle_item,
                bareword: handle_item,
                closeBracket: () => ({mode: "end"}),
                ellipsis,
                questionMark: handle_item,
                varname: handle_item,
            },
            later: {
                ...this.commentOrSpace,
                ampersand: handle_item,
                bareword: handle_item,
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
