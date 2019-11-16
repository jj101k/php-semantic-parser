import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserFunctionArgument } from "./function-argument"
export class ParserCatch extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => {
                    const node = new ParserFunctionArgument()
                    return {consumer: node, mode: "postExpression"}
                },
                space: () => {},
            },
            postExpression: {
                closeBracket: () => ({mode: "postSetup"}),
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "end", reconsume: true}
                },
            },
        }
    }
}
