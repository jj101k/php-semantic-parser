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
        return {
            ...modes,
            case: ParserExpression.expressionParser(
                php => {},
                "postCase"
            ),
            entry: new ParserStateHandler({
                bareword_case: () => ParserStateChange.mode("case"),
                bareword_default: () => ParserStateChange.mode("postCase"),
                ...modes.entry.handlers,
            }),
            initial: new ParserStateHandler({
                bareword_case: () => ParserStateChange.mode("case"),
                bareword_default: () => ParserStateChange.mode("postCase"),
                ...modes.initial.handlers,
            }),
            postCase: new ParserStateHandler({
                colon: () => ParserStateChange.mode("entry"),
            }),
        }
    }
}
