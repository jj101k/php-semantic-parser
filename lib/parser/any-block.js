import { ParserBase } from "./base"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"
import { ParserForeach } from "./foreach"

export class ParserAnyBlock {
    /**
     *
     * @param {string} c
     * @returns {?ParserBase}
     */
    static barewordHandler(c) {
        switch(c) {
            case "echo": return new ParserEcho()
            case "foreach": return new ParserForeach()
            case "function": return new ParserFunction()
            default: return null
        }
    }
}