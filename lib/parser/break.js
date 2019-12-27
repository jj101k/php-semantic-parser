import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserBreak extends ParserBase {
    constructor() {
        super()
        this.distance = 1
    }
    get modes() {
        return {
            initial: {
                semicolon: () => ({mode: "end"}),
                space: () => ({mode: "distance"}),
            },
            distance: {
                number: n => {
                    this.distance = n
                    return {mode: "postArgument"}
                },
                semicolon: () => ({mode: "end"}),
            },
            postArgument: {
                semicolon: () => ({ mode: "end" }),
                space: () => {},
            },
        }
    }
}
