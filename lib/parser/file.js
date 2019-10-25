import { Token } from "../lex"

class ParserString {
    /**
     *
     * @param {string} contents
     */
    constructor(contents) {
        this.contents = contents
    }
}

class ParserTemplateString {
    /**
     *
     * @param {string} quote_type
     */
    constructor(quote_type) {
        this.quoteType = quote_type
    }
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        const nodes = []
        let active_string = ""
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(t.type == "string") {
                active_string += t.content
            } else if(t.type == "escape") {
                i++
                if(tokens[i + 1].content == "n") {
                    active_string += "\n"
                }
            } else if(t.type == this.quoteType) {
                if(active_string.length) {
                    nodes.push(new ParserString(active_string))
                }
                this.nodes = nodes
                return i + 1
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        throw new Error("Unterminated string")
    }
}

class ParserEcho {
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        const nodes = []
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(i == 0) {
                if(t.type != "space") {
                    throw new Error(`Invalid node type: ${t.type}`)
                }
            } else if(t.type == "quote-double") {
                const php = new ParserTemplateString(t.type)
                const consumed = php.parse(tokens.slice(i + 1))
                nodes.push(php)
                i += consumed
            } else if(t.type == "semicolon") {
                this.nodes = nodes
                return i + 1
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        throw new Error("Unterminated statement")
    }
}

class ParserPHP {
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        const nodes = []
        let i
        for(i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(t.type == "space") {
                // CONSUME
            } else if(t.type == "bareword") {
                if(t.content == "echo") {
                    const php = new ParserEcho()
                    const consumed = php.parse(tokens.slice(i + 1))
                    nodes.push(php)
                    i += consumed
                } else {
                    throw new Error(`Unknown bareword ${t.content}`)
                }
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        this.nodes = nodes
        return i
    }
}
export class ParserFile {
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        const nodes = []
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(t.type == "php") {
                const php = new ParserPHP()
                const consumed = php.parse(tokens.slice(i + 1))
                nodes.push(php)
                i += consumed
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        this.nodes = nodes
    }
}