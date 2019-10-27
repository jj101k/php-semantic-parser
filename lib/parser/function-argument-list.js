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
                reconsume: true
            }
        }
        return {
            initial: {
                bareword: handle_item,
                closeBracket: () => ({ mode: "end" }),
                varname: handle_item,
            },
            later: {
                bareword: handle_item,
                varname: handle_item,
            },
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
        }
    }
}
