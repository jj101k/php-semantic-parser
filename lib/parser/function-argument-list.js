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
        return {
            afterLast: {
                closeBracket: () => ({mode: "end"}),
            },
            initial: {
                ...this.commentOrSpace,
                closeBracket: () => ({mode: "end"}),
                $else: handle_item,
            },
            later: {
                ...this.commentOrSpace,
                space: () => {},
                $else: handle_item,
            },
            next: {
                closeBracket: () => ({mode: "end"}),
                comma: () => ({mode: "later"}),
            },
        }
    }
}
