import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserAnyBlock } from "./any-block"
import { ParserExpression } from "./expression"
export class ParserFunctionBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: Object.assign(
                {
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
}
