import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSwitchBlock } from "./switch-block"
export class ParserSwitch extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => ({ mode: "source" }),
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserSwitchBlock()
                    return {consumer: this.block, mode: "end", reconsume: true}
                },
            },
            postSource: {
                closeBracket: () => ({mode: "postSetup"}),
                space: () => {},
            },
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
