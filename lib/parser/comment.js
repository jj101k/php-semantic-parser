import { ParserBase } from "./base"
import { ParserString } from "./string"
import { ParserStateChange } from "../parser-state-change"

export class ParserComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        return {
            initial: {
                $pop: () => new ParserStateChange(null, "end"),
                escapedCharacter: c => {
                    this.content += ParserString.escapeCharacter(c)
                },
                string: (c) => { this.content += c; },
            },
        }
    }
}
