import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"

export class ParserBreak extends ParserBase {
    constructor() {
        super()
        this.distance = 1
    }
    get modes() {
        return {
            initial: {
                semicolon: () => this.end,
                space: () => ParserStateChange.mode("distance"),
            },
            distance: {
                number: n => {
                    this.distance = n
                    return ParserStateChange.mode("postArgument")
                },
                semicolon: () => this.end,
            },
            postArgument: {
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            },
        }
    }
}
