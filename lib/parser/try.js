import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserTry extends ParserBase {
    get modes() {
        return {
            initial: new ParserStateHandler({
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
            }),
        }
    }
}
