import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserAnyBlock } from "./any-block"
import { ParserExpression } from "./expression"
export class ParserSwitchBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const entry = Object.assign(
            {
                bareword_default: () => {
                    return {mode: "possibleLabel"}
                },
                closeCurly: () => ({ mode: "end" }),
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return {consumer: php}
                },
                space: () => { },
            },
            ParserAnyBlock.blockStatementParser(php => this.nodes.push(php)),
            ParserExpression.expressionParser(php => this.nodes.push(php), "lineEnd")
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
            possibleLabel: {
                colon: () => {
                    // Default
                    return {mode: "entry"}
                }
            },
            postIf: Object.assign(
                {},
                entry,
                ParserAnyBlock.postIfParser(php => this.nodes.push(php))
            ),
        }
    }
}
