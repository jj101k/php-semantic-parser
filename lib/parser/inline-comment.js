import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change";

export class ParserInlineComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        return {
            initial: {
                $pop: () => ParserStateChange.mode("end"),
                string: (c) => { this.content += c; },
            },
        }
    }
}
