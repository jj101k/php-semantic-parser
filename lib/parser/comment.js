import { ParserBase } from "./base"
import { ParserString } from "./string"

export class ParserComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        return {
            initial: {
                $pop: () => ({ mode: "end" }),
                escapedCharacter: c => {
                    this.content += ParserString.escapeCharacter(c)
                },
                string: (c) => { this.content += c; },
            },
        }
    }
}
