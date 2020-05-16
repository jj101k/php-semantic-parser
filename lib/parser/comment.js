import { ParserBase } from "./base"
import { ParserString } from "./string"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get initialMode() {
        return new ParserStateHandler({
            $pop: () => ParserStateChange.end,
            escapedCharacter: c => {
                this.content += ParserString.escapeCharacter(c)
            },
            string: (c) => { this.content += c; },
        })
    }
}
