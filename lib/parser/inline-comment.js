import { ParserBase } from "./base"

export class ParserInlineComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        return {
            initial: {
                lineEnd: () => ({ mode: "end" }),
                string: (c) => { this.content += c; },
            },
        }
    }
}
