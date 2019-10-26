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
            } else if(t.type == "quote-double") {
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

/**
 * @typedef {{mode?: string, increment?: number}} parserStateChange
 */

class ParserBase {
    /**
     * @type {{[mode: string]: {[token_type: string]: (c: string, i: number, okens: Token[]) => (parserStateChange|void)}}}
     */
    get modes() {
        throw new Error("Not implemented")
    }
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        let mode = "initial"
        this.startParse()
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(this.modes[mode][t.type]) {
                const r = this.modes[mode][t.type](t.content, i, tokens)
                if(r) {
                    if(r.increment) {
                        i += r.increment
                    }
                    if(r.mode) {
                        mode = r.mode
                    }
                }
                if(mode == "end") {
                    return i + 1
                }
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        throw new Error("Unterminated value")
    }
    startParse() {
        // Nothing
    }
}

class ParserComment extends ParserBase {
    get modes() {
        return {
            escape: {
                "escaped-char": c => {
                    if(c == "n") {
                        this.content += "\n"
                    } else {
                        console.log(`Unknown escape \\${c}`)
                        this.content += c
                    }
                    return {mode: "initial"}
                },
            },
            initial: {
                "comment-end": () => ({mode: "end"}),
                escape: () => ({mode: "escape"}),
                string: (c) => {this.content += c},
            },
        }
    }
    startParse() {
        this.content = ""
    }
}

class ParserVariable {
    /**
     *
     * @param {string} name
     */
    constructor(name) {
        this.name = name
    }
}

class ParserStringConcatenation extends ParserBase {
    constructor(left) {
        super()
        this.left = left
    }
    get modes() {
        return {
            initial: {
                space: () => {},
                "quote-double": (c, i, tokens) => {
                    const php = new ParserTemplateString()
                    const consumed = php.parse(tokens.slice(i + 1))
                    this.right = php
                    return {mode: "end", increment: consumed}
                },
                varname: c => {
                    this.right = new ParserVariable(c)
                },
            },
        }
    }
    startParse() {
        this.nodes = []
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
                const php = new ParserTemplateString()
                const consumed = php.parse(tokens.slice(i + 1))
                nodes.push(php)
                i += consumed
            } else if(t.type == "semicolon") {
                this.nodes = nodes
                return i + 1
            } else if(t.type == "varname") {
                nodes.push(new ParserVariable(t.content))
            } else if(t.type == "space") {
                // Skip
            } else if(t.type == "dot") {
                const concatenation = new ParserStringConcatenation(
                    nodes.pop()
                )
                const consumed = concatenation.parse(tokens.slice(i + 1))
                nodes.push(concatenation)
                i += consumed
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        throw new Error("Unterminated statement")
    }
}

class ParserFunctionArgument {
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(i == 0 && t.type == "bareword") {
                this.type = t.content
            } else if(i == 1 && t.type == "space") {
                // Expected
            } else if(i == 2 && t.type == "varname") {
                this.name = t.content
            } else if(this.name) {
                return i - 1
            }
        }
        throw new Error(`Argument with no name?`)
    }
}

class ParserFunctionArgumentList {
    /**
     *
     * @param {Token[]} tokens
     */
    parse(tokens) {
        const nodes = []
        for(let i = 0; i < tokens.length; i++) {
            const t = tokens[i]
            if(t.type == "bareword") {
                const arg = new ParserFunctionArgument()
                const consumed = arg.parse(tokens.slice(i)) // Current
                nodes.push(arg)
                i += consumed
            } else if(t.type == "close-bracket") {
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

class ParserFunction {
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
            } else if(i == 1) {
                if(t.type == "bareword") {
                    this.name = t.content
                } else {
                    throw new Error(`Invalid node type: ${t.type}`)
                }
            } else if(i == 2) {
                if(t.type == "open-bracket") {
                    this.arguments = new ParserFunctionArgumentList()
                    const consumed = this.arguments.parse(tokens.slice(i + 1))
                    i += consumed
                } else {
                    throw new Error(`Invalid node type: ${t.type}`)
                }
            } else if(t.type == "colon") {
                i++
                for(; i < tokens.length; i++) {
                    const t = tokens[i]
                    if(t.type == "space") {
                        // Ignore
                    } else if(t.type == "bareword") {
                        this.returnType = tokens[i].content
                        break
                    } else {
                        console.log(tokens.slice(i))
                        throw new Error(`Unexpected node of type ${t.type}`)
                    }
                }
            } else if(t.type == "space") {
                // Ignore it
            } else if(t.type == "open-curly") {
                this.content = new ParserFunctionBlock()
                const consumed = this.content.parse(tokens.slice(i + 1))
                i += consumed
                return i + 1
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        throw new Error("Unterminated statement")
    }
}

class ParserFunctionBlock {
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
                } else if(t.content == "function") {
                    const php = new ParserFunction()
                    const consumed = php.parse(tokens.slice(i + 1))
                    nodes.push(php)
                    i += consumed
                } else {
                    throw new Error(`Unknown bareword ${t.content}`)
                }
            } else if(t.type == "comment") {
                const php = new ParserComment()
                const consumed = php.parse(tokens.slice(i + 1))
                nodes.push(php)
                i += consumed
            } else if(t.type == "close-curly") {
                this.nodes = nodes
                return i + 1
            } else {
                console.log(tokens.slice(i))
                throw new Error(`Unexpected node of type ${t.type}`)
            }
        }
        throw new Error(`Unterminated block`)
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
                } else if(t.content == "function") {
                    const php = new ParserFunction()
                    const consumed = php.parse(tokens.slice(i + 1))
                    nodes.push(php)
                    i += consumed
                } else {
                    throw new Error(`Unknown bareword ${t.content}`)
                }
            } else if(t.type == "comment") {
                const php = new ParserComment()
                const consumed = php.parse(tokens.slice(i + 1))
                nodes.push(php)
                i += consumed
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