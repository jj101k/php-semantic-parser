import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSwitchBlock } from "./switch-block"
import { ParserStateChange } from "../parser-state-change"

export class ParserSwitch extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => new ParserStateChange(null, "source"),
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserSwitchBlock()
                    return new ParserStateChange(this.block, "end", 1)
                },
            },
            postSource: {
                closeBracket: () => new ParserStateChange(null, "postSetup"),
                space: () => {},
            },
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
