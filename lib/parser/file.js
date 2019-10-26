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

/**
 * @typedef {{consumer?: ParserBase, mode?: string, reconsume?: boolean}} parserStateChange
 */

class ParserBase {
    /**
     * @type {{[mode: string]: {[token_type: string]: (c: string) => (parserStateChange|void)}}}
     */
    get modes() {
        throw new Error("Not implemented")
    }
    onEOF() {
        throw new Error("Unterminated value")
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
                const r = this.modes[mode][t.type](t.content)
                if(r) {
                    if(r.consumer) {
                        const consumed = r.consumer.parse(
                            tokens.slice(r.reconsume ? i : (i + 1))
                        )
                        i += r.reconsume ? consumed - 1 : consumed
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
        this.onEOF()
    }
    startParse() {
        // Nothing
    }
}

class ParserTemplateString extends ParserBase {
    get modes() {
        return {
            escape: {
                escapedChar: c => {
                    if(c == "n") {
                        this.activeString += "\n"
                    } else {
                        console.log(`Unknown escape \\${c}`)
                        this.activeString += c
                    }
                    return {mode: "initial"}
                },
            },
            initial: {
                escape: () => ({mode: "escape"}),
                quoteDouble: () => {
                    if(this.activeString.length) {
                        this.nodes.push(new ParserString(this.activeString))
                    }
                    return ({mode: "end"})
                },
                string: c => {this.activeString += c},
            },
        }
    }
    startParse() {
        this.activeString = ""
        this.nodes = []
    }
}

class ParserComment extends ParserBase {
    get modes() {
        return {
            escape: {
                escapedChar: c => {
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
                commentEnd: () => ({mode: "end"}),
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
                quoteDouble: () => {
                    this.right = new ParserTemplateString()
                    return {consumer: this.right, mode: "end"}
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

class ParserEcho extends ParserBase {
    get modes() {
        return {
            initial: {
                space: () => ({mode: "argument"}),
            },
            argument: {
                quoteDouble: () => {
                    const php = new ParserTemplateString()
                    this.nodes.push(php)
                    return {consumer: php, mode: "postArgument"}
                },
                varname: c => {
                    this.nodes.push(new ParserVariable(c))
                    return {mode: "postArgument"}
                },
            },
            postArgument: {
                dot: () => {
                    const concatenation = new ParserStringConcatenation(
                        this.nodes.pop()
                    )
                    this.nodes.push(concatenation)
                    return {consumer: concatenation}
                },
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
        }
    }
    startParse() {
        this.nodes = []
    }
}

class ParserFunctionArgument extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword: c => {
                    this.type = c
                    return {mode: "name"}
                },
                varname: c => {
                    this.name = c
                    return {mode: "end"}
                },
            },
            name: {
                space: () => {},
                varname: c => {
                    this.name = c
                    return {mode: "end"}
                },
            },
        }
    }
}

class ParserFunctionArgumentList extends ParserBase {
    get modes() {
        const handle_item = () => {
            const arg = new ParserFunctionArgument()
            this.nodes.push(arg)
            return {
                consumer: arg,
                mode: "next",
                reconsume: true
            }
        }
        return {
            initial: {
                bareword: handle_item,
                closeBracket: () => ({mode: "end"}),
                varname: handle_item,
            },
            later: {
                bareword: handle_item,
                varname: handle_item,
            },
            next: {
                closeBracket: () => ({mode: "end"}),
                comma: () => ({mode: "initial"}),
            },
        }
    }
    startParse() {
        this.nodes = []
    }
}

class ParserFunction extends ParserBase {
    get modes() {
        return {
            argumentList: {
                openBracket: () => {
                    this.arguments = new ParserFunctionArgumentList()
                    return {consumer: this.arguments, mode: "postArguments"}
                },
            },
            initial: {
                space: () => ({mode: "name"}),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return {mode: "argumentList"}
                },
            },
            postArguments: {
                colon: () => ({mode: "returnType"}),
            },
            postReturn: {
                openCurly: () => {
                    this.content = new ParserFunctionBlock()
                    return {consumer: this.content, mode: "end"}
                },
                space: () => {},
            },
            returnType: {
                bareword: c => {
                    this.returnType = c
                    return {mode: "postReturn"}
                },
                space: () => {},
            },
        }
    }
    startParse() {
        this.nodes = []
    }
}

class ParserFunctionBlock extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword: c => {
                    let php
                    if(c == "echo") {
                        php = new ParserEcho()
                    } else if(c == "function") {
                        php = new ParserFunction()
                    } else {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.nodes.push(php)
                    return {consumer: php}
                },
                closeCurly: () => ({mode: "end"}),
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return {consumer: php}
                },
                space: () => {},
            },
        }
    }
    startParse() {
        this.nodes = []
    }
}

class ParserPHP extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword: (c, i, tokens) => {
                    let php
                    if(c == "echo") {
                        php = new ParserEcho()
                    } else if(c == "function") {
                        php = new ParserFunction()
                    } else {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.nodes.push(php)
                    return {consumer: php}
                },
                closeCurly: () => ({mode: "end"}),
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return {consumer: php}
                },
                space: () => {},
            },
        }
    }
    onEOF() {
        // Do nothing
    }
    startParse() {
        this.nodes = []
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