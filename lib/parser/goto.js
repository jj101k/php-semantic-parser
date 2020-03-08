import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserGoto extends ParserBase {
    constructor() {
        super()
        this.target = null
    }
    get modes() {
        const initial = new ParserStateHandler({
            bareword: c => {
                this.target = c
                return ParserStateChange.mode("lineEnd")
            },
            space: () => {},
        })
        const lineEnd = new ParserStateHandler({
            semicolon: () => this.end,
        })
        return {initial, lineEnd}
    }
}
