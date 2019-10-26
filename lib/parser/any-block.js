import { ParserBase } from "./base"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"

export class ParserAnyBlock {
    /**
     *
     * @param {string} c
     * @returns {?ParserBase}
     */
    static barewordHandler(c) {
        switch(c) {
            case "echo": return new ParserEcho()
            case "function": return new ParserFunction()
            default: return null
        }
    }
}