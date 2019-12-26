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
            initial: {
                ampersand: handle_item,
                bareword: handle_item,
                closeBracket: () => ({ mode: "end" }),
                space: () => {},
                varname: handle_item,
            },
            later: {
                ampersand: handle_item,
                bareword: handle_item,
                space: () => {},
                varname: handle_item,
            },
            next: {
                closeBracket: () => ({ mode: "end" }),
                comma: () => ({ mode: "later" }),
            },
        }
    }
}
