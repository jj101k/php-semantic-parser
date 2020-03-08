import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserIf extends ParserBase {
    get modes() {
        const entry = new ParserStateHandler({
            ...ParserLine.lineParser(l => this.block = l, "end"),
            colon: () => ParserStateChange.mode("nonPhpBlock"),
            space: () => {},
        })
        const expression = ParserExpression.expressionParser(
            php => this.source = php,
            "postExpression"
        )
        const initial = new ParserStateHandler({
            openBracket: () => ParserStateChange.mode("expression"),
            space: () => {},
        })
        const nonPhpBlock = new ParserStateHandler({
            bareword_else: () => this.nope,
            bareword_elseif: () => this.nope,
            bareword_endif: () => this.end,
            ...ParserLine.lineParser(l => this.block = l),
        })
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode("entry"),
            space: () => {},
        })
        return {entry, expression, initial, nonPhpBlock, postExpression}
    }
}
