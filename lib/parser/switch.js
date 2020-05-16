import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSwitchBlock } from "./switch-block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserSwitch extends ParserBase {
    get initialMode() {
        const postSetup = new ParserStateHandler({
            space: () => {},
            openCurly: () => {
                this.block = new ParserSwitchBlock()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd(), 1)
            },
        })
        const postSource = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(postSetup),
            space: () => {},
        })
        const source = ParserExpression.expressionParser(
            php => this.source = php,
            postSource
        )
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(source),
            space: () => {},
        })
    }
}
