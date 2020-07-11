import { Token } from "../lex"
import { ParserPHP } from "./php"
import { NamespaceVariable } from "../namespace/variable"

export class ParserFile {
    /**
     *
     * @param {Token[]} tokens
     * @param {string} filename
     */
    parse(tokens, filename) {
        const nodes = []
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(t.type == "php") {
                const php = new ParserPHP()
                const consumed = php.parse(tokens.slice(i + 1), filename)
                nodes.push(php)
                i += consumed
            } else if(t.type == "$other") {
                i++
            } else {
                console.log(tokens.slice(i))
                const position_info = t.position ?
                    ` at line ${t.position.line + 1} column ${t.position.lineOffset}` :
                    ""
                throw new Error(`Unexpected node of type ${t.type}${position_info}`)
            }
        }
        this.nodes = nodes
    }
}