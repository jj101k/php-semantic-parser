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
                space: () => new ParserStateChange(null, "distance"),
            },
            distance: {
                number: n => {
                    this.distance = n
                    return new ParserStateChange(null, "postArgument")
                },
                semicolon: () => this.end,
            },
            postArgument: {
                semicolon: () => new ParserStateChange(null, "end"),
                space: () => {},
            },
        }
    }
}
