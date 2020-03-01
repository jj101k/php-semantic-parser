import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"

export class ParserGoto extends ParserBase {
    constructor() {
        super()
        this.target = null
    }
    get modes() {
        return {
            initial: {
                bareword: c => {
                    this.target = c
                    return new ParserStateChange(null, "lineEnd")
                },
                space: () => {},
            },
            lineEnd: {
                semicolon: () => this.end,
            },
        }
    }
}
