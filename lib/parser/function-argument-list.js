import { ParserBase } from "./base"
import { ParserFunctionArgument } from "./function-argument"
import { ParserStateHandler } from "../parser-state-handler"
import { ParserStateChange } from "../parser-state-change"

export class ParserFunctionArgumentList extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const handle_item = () => {
            const arg = new ParserFunctionArgument()
            this.nodes.push(arg)
            return new ParserStateChange(arg, "next", 1)
        }
        const afterLast = new ParserStateHandler({
            closeBracket: () => this.end,
        })
        const initial = new ParserStateHandler({
            ...this.commentOrSpace,
            closeBracket: () => this.end,
            $else: handle_item,
        })
        const later = new ParserStateHandler({
            ...this.commentOrSpace,
            space: () => {},
            $else: handle_item,
        })
        const next = new ParserStateHandler({
            closeBracket: () => this.end,
            comma: () => ParserStateChange.mode("later"),
        })
        return {afterLast, initial, later, next}
    }
}
