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
        return {
            initial: {
                bareword: (c) => {
                    const php = ParserAnyBlock.barewordHandler(c)
                    if(!php) {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.nodes.push(php)
                    return {consumer: php}
                },
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
            possibleLabel: {
                colon: () => {
                    // Default
                    return {mode: "initial"}
                }
            }
        }
    }
}
