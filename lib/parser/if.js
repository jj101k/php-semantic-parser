import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"
import { ParserStateChange } from "../parser-state-change"

export class ParserIf extends ParserBase {
    get modes() {
        return {
            entry: {
                ...ParserLine.lineParser(l => this.block = l, "end"),
                colon: () => ParserStateChange.mode("nonPhpBlock"),
                space: () => {},
            },
            initial: {
                openBracket: () => ParserStateChange.mode("expression"),
                space: () => {},
            },
            nonPhpBlock: {
                bareword_else: () => this.nope,
                bareword_elseif: () => this.nope,
                bareword_endif: () => this.end,
                ...ParserLine.lineParser(l => this.block = l),
            },
            postExpression: {
                closeBracket: () => ParserStateChange.mode("entry"),
                space: () => {},
            },
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
