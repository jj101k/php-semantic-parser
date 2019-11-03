import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSwitchBlock } from "./switch-block"
export class ParserSwitch extends ParserBase {
    get modes() {
        const handle_expression = ParserExpression.handleExpression(
            php => this.source = php,
            "postSource"
        )
        return {
            initial: {
                openBracket: () => ({ mode: "source" }),
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserSwitchBlock()
                    return {consumer: this.block, mode: "end"}
                },
            },
            postSource: {
                closeBracket: () => ({mode: "postSetup"}),
                space: () => {},
            },
            source: {
                varname: handle_expression,
            },
        }
    }
}
