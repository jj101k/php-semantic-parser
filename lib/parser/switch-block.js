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
                bareword_case: () => new ParserStateChange(null, "case"),
                bareword_default: () => new ParserStateChange(null, "postCase"),
                ...modes.entry,
            },
            initial: {
                bareword_case: () => new ParserStateChange(null, "case"),
                bareword_default: () => new ParserStateChange(null, "postCase"),
                ...modes.initial,
            },
            postCase: {
                colon: () => new ParserStateChange(null, "entry"),
            },
        }
    }
}
