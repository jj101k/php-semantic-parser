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
                $pop: () => new ParserStateChange(null, "end"),
                string: (c) => { this.content += c; },
            },
        }
    }
}
