import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change";
import { ParserStateHandler } from "../parser-state-handler";

export class ParserInlineComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        const initial = new ParserStateHandler({
            $pop: () => ParserStateChange.mode("end"),
            string: (c) => { this.content += c; },
        })
        return {initial}
    }
}
