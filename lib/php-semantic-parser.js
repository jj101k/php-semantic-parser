import { ParserFile } from "./parser/file"
import { Lex } from "./lex"

export class PHPSemanticParser {
    /**
     *
     * @param {string} contents
     */
    constructor(contents) {
        this.contents = contents
    }
    parse() {
        const tokens = new Lex(this.contents).tokens
        if(process.env["debug"]) {
            console.log(tokens.join("\n"))
        }
        const start = new ParserFile()
        start.parse(tokens)
        return start
    }
}