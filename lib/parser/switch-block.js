import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

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
                bareword_case: () => ({mode: "case"}),
                bareword_default: () => ({mode: "postCase"}),
                ...modes.entry,
            },
            initial: {
                bareword_case: () => ({mode: "case"}),
                bareword_default: () => ({mode: "postCase"}),
                ...modes.initial,
            },
            postCase: {
                colon: () => ({mode: "entry"}),
            },
        }
    }
}
