import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserFunctionArgument } from "./function-argument"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserCatch extends ParserBase {
    get initialMode() {
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(postSetup),
            space: () => {},
        })
        const postSetup = new ParserStateHandler({
            space: () => {},
            openCurly: () => {
                this.block = new ParserBlock()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd(), 1)
            },
        })
        return new ParserStateHandler({
            openBracket: () => {
                const node = new ParserFunctionArgument()
                return new ParserStateChange(node, postExpression)
            },
            space: () => {},
        })
    }
}
