import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserFunctionArgument } from "./function-argument"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserCatch extends ParserBase {
    get modes() {
        return {
            initial: new ParserStateHandler({
                openBracket: () => {
                    const node = new ParserFunctionArgument()
                    return new ParserStateChange(node, "postExpression")
                },
                space: () => {},
            }),
            postExpression: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("postSetup"),
                space: () => {},
            }),
            postSetup: new ParserStateHandler({
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
            }),
        }
    }
}
