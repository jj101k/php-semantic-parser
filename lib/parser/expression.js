import { ParserBase } from "./base"
import { ParserTemplateString } from "./template-string"
import { ParserVariable } from "./variable"
import { ParserStringConcatenation } from "./string-concatenation"
export class ParserExpression extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                quoteDouble: () => {
                    const php = new ParserTemplateString()
                    this.nodes.push(php)
                    return { consumer: php, mode: "postArgument" }
                },
                varname: c => {
                    this.nodes.push(new ParserVariable(c))
                    return { mode: "postArgument" }
                },
            },
            postArgument: {
                dot: () => {
                    const concatenation = new ParserStringConcatenation(this.nodes.pop())
                    this.nodes.push(concatenation)
                    return { consumer: concatenation }
                },
                semicolon: () => ({ mode: "end", reconsume: true }),
                space: () => { },
            },
        }
    }
}
