import { ParserBase } from "./base"

export class ParserBreak extends ParserBase {
    constructor() {
        super()
        this.distance = 1
    }
    get modes() {
        return {
            initial: {
                semicolon: () => this.end,
                space: () => ({mode: "distance"}),
            },
            distance: {
                number: n => {
                    this.distance = n
                    return {mode: "postArgument"}
                },
                semicolon: () => this.end,
            },
            postArgument: {
                semicolon: () => ({ mode: "end" }),
                space: () => {},
            },
        }
    }
}
