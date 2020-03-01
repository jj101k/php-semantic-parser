import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSwitchBlock } from "./switch-block"
import { ParserStateChange } from "../parser-state-change"

export class ParserSwitch extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => ParserStateChange.mode("source"),
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
                closeBracket: () => ParserStateChange.mode("postSetup"),
                space: () => {},
            },
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
