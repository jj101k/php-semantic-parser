import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserStateChange } from "../parser-state-change"

export class ParserTry extends ParserBase {
    get modes() {
        return {
            initial: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
            },
        }
    }
}
