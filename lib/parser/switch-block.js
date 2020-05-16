import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserSwitchBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        return ParserAnyBlock.generalModes(
            php => this.nodes.push(php),
            entry => {
                const postCase = new ParserStateHandler({
                    colon: () => ParserStateChange.mode(entry),
                })
                const phpCase = ParserExpression.expressionParser(
                    php => {},
                    postCase
                )
                return {
                    bareword_case: () => ParserStateChange.mode(phpCase),
                    bareword_default: () => ParserStateChange.mode(postCase),
                }
            }
        )
    }
}
