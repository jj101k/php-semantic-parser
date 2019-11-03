import { ParserNamespace } from "./namespace"
import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserClass } from "./class"
import { ParserAnyBlock } from "./any-block"
import { ParserExpression } from "./expression"
export class ParserPHP extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: Object.assign(
                {
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
                    closeCurly: () => ({ mode: "end" }),
                    comment: () => {
                        const php = new ParserComment()
                        this.nodes.push(php)
                        return { consumer: php }
                    },
                    space: () => { },
                },
                ParserAnyBlock.blockStatementParser(php => this.nodes.push(php)),
                ParserExpression.expressionParser(php => this.nodes.push(php), "lineEnd")
            ),
            lineEnd: {
                semicolon: () => ({mode: "initial"}),
            },
        }
    }
    onEOF() {
        // Do nothing
    }
}
