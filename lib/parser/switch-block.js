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
    get modes() {
        const modes = ParserAnyBlock.generalModes(php => this.nodes.push(php))
        const entry = new ParserStateHandler({
            bareword_case: () => ParserStateChange.mode("phpCase"),
            bareword_default: () => ParserStateChange.mode("postCase"),
            ...modes.entry.handlers,
        })
        const initial = new ParserStateHandler({
            bareword_case: () => ParserStateChange.mode("phpCase"),
            bareword_default: () => ParserStateChange.mode("postCase"),
            ...modes.initial.handlers,
        })
        const phpCase = ParserExpression.expressionParser(
            php => {},
            "postCase"
        )
        const postCase = new ParserStateHandler({
            colon: () => ParserStateChange.mode("entry"),
        })
        return {...modes, entry, initial, phpCase, postCase}
    }
}
