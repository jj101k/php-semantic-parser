import { ParserNamespace } from "./namespace"
import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserClass } from "./class"
import { ParserAnyBlock } from "./any-block"
import { ParserExpression } from "./expression"
import { ParserBlock } from "./block"
import { ParserIf } from "./if"
export class ParserPHP extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const entry = Object.assign(
            {
                bareword_abstract: () => {
                    const php = new ParserClass(true)
                    this.nodes.push(php)
                    return {mode: "classDefinition"}
                },
                bareword_class: () => {
                    const php = new ParserClass()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                bareword_namespace: () => {
                    const php = new ParserNamespace()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                space: () => { },
            },
            ParserAnyBlock.blockStatementParser(php => this.nodes.push(php)),
            ParserExpression.expressionParser(php => this.nodes.push(php), "lineEnd")
        )
        return {
            entry: entry,
            initial: entry,
            classDefinition: {
                bareword_class: () => ({consumer: this.nodes[this.nodes.length - 1], mode: "entry"}),
                space: () => { },
            },
            lineEnd: {
                semicolon: () => ({mode: "entry"}),
            },
        }
    }
    onEOF() {
        // Do nothing
    }
}
