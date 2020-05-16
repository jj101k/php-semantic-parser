import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserTry extends ParserBase {
    get initialMode() {
        return new ParserStateHandler({
            space: () => {},
            openCurly: () => {
                this.block = new ParserBlock()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd(), 1)
            },
        })
    }
}
