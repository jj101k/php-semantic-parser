import { ParserBase } from "./base"
import { ParserString } from "./string"

export class ParserComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        return {
            escape: {
                $pop: c => {
                    this.content += ParserString.escapeCharacter(c)
                    return {mode: "initial"}
                },
            },
            initial: {
                $pop: () => ({ mode: "end" }),
                escape: () => ({ mode: "escape" }),
                string: (c) => { this.content += c; },
            },
        }
    }
}
