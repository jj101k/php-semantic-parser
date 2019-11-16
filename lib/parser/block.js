import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserAnyBlock } from "./any-block"
import { ParserInlineComment } from "./inline-comment"
export class ParserBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const entry = Object.assign(
            {
                closeCurly: () => ({ mode: "end" }),
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                inlineComment: () => {
                    const php = new ParserInlineComment()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                space: () => { },
            },
            ParserAnyBlock.blockStatementParser(php => this.nodes.push(php))
        )
        return {
            entry: entry,
            initial: {
                openCurly: () => ({mode: "entry"}),
                space: () => { },
            },
            lineEnd: {
                semicolon: () => ({mode: "entry"}),
            },
            postIf: Object.assign(
                {},
                entry,
                ParserAnyBlock.postIfParser(php => this.nodes.push(php))
            ),
            postTry: Object.assign(
                {},
                entry,
                ParserAnyBlock.postTryParser(php => this.nodes.push(php))
            ),
        }
    }
}
