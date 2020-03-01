import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserFunctionArgument } from "./function-argument"
import { ParserStateChange } from "../parser-state-change"

export class ParserCatch extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => {
                    const node = new ParserFunctionArgument()
                    return new ParserStateChange(node, "postExpression")
                },
                space: () => {},
            },
            postExpression: {
                closeBracket: () => new ParserStateChange(null, "postSetup"),
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
            },
        }
    }
}
