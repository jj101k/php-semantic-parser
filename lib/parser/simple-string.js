import { ParserBase } from "./base"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserSimpleString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
    }
    get modes() {
        const initial = new ParserStateHandler({
            $pop: () => this.end,
            escapedCharacter: c => {
                if(c == "\\'") {
                    this.activeString += "'"
                } else {
                    this.activeString += c
                }
            },
            string: c => { this.activeString += c },
        })
        return {initial}
    }
}
