import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserContinue extends ParserBase {
    constructor() {
        super()
        this.distance = 1
    }
    get initialMode() {
        const distance = new ParserStateHandler({
            number: n => {
                this.distance = n
                return ParserStateChange.mode(postArgument)
            },
            semicolon: () => this.end,
        })
        const postArgument = new ParserStateHandler({
            semicolon: () => ParserStateChange.end,
            space: () => {},
        })
        return new ParserStateHandler({
            semicolon: () => this.end,
            space: () => ParserStateChange.mode(distance),
        })
    }
}
