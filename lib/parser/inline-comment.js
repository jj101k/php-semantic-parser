import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change";
import { ParserStateHandler } from "../parser-state-handler";

export class ParserInlineComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get initialMode() {
        return new ParserStateHandler({
            $pop: () => ParserStateChange.end,
            string: (c) => { this.content += c; },
        })
    }
}
