import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserIf extends ParserBase {
    get modes() {
        return {
            entry: new ParserStateHandler({
                ...ParserLine.lineParser(l => this.block = l, "end"),
                colon: () => ParserStateChange.mode("nonPhpBlock"),
                space: () => {},
            }),
            initial: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("expression"),
                space: () => {},
            }),
            nonPhpBlock: new ParserStateHandler({
                bareword_else: () => this.nope,
                bareword_elseif: () => this.nope,
                bareword_endif: () => this.end,
                ...ParserLine.lineParser(l => this.block = l),
            }),
            postExpression: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("entry"),
                space: () => {},
            }),
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
