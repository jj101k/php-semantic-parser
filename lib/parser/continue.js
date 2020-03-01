import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserContinue extends ParserBase {
    constructor() {
        super()
        this.distance = 1
    }
    get modes() {
        return {
            initial: new ParserStateHandler({
                semicolon: () => this.end,
                space: () => ParserStateChange.mode("distance"),
            }),
            distance: new ParserStateHandler({
                number: n => {
                    this.distance = n
                    return ParserStateChange.mode("postArgument")
                },
                semicolon: () => this.end,
            }),
            postArgument: new ParserStateHandler({
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            }),
        }
    }
}
