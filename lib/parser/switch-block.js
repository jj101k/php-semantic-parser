import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

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
            entry: {
                bareword_case: () => ParserStateChange.mode("case"),
                bareword_default: () => ParserStateChange.mode("postCase"),
                ...modes.entry,
            },
            initial: {
                bareword_case: () => ParserStateChange.mode("case"),
                bareword_default: () => ParserStateChange.mode("postCase"),
                ...modes.initial,
            },
            postCase: {
                colon: () => ParserStateChange.mode("entry"),
            },
        }
    }
}
