import { Lex } from "./lex"
import { ParserFile } from "./parser/file"

export class PHPSemanticParser {
    /**
     *
     * @param {string} contents
     */
    constructor(contents) {
        this.contents = contents
    }
    /**
     *
     * @param {string} filename
     */
    parse(filename) {
        const tokens = new Lex(this.contents).tokens
        if(process.env.debug) {
            console.log(tokens.join("\n"))
        }
        const start = new ParserFile()
        start.parse(tokens, filename)
        return start
    }
}