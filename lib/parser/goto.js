import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserGoto extends ParserBase {
    constructor() {
        super()
        this.target = null
    }
    get modes() {
        return {
            initial: new ParserStateHandler({
                bareword: c => {
                    this.target = c
                    return ParserStateChange.mode("lineEnd")
                },
                space: () => {},
            }),
            lineEnd: new ParserStateHandler({
                semicolon: () => this.end,
            }),
        }
    }
}
