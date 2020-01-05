import { ParserBase } from "./base"

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
                    return {mode: "lineEnd"}
                },
                space: () => {},
            },
            lineEnd: {
                semicolon: () => this.end,
            },
        }
    }
}
