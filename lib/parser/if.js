import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserIf extends ParserBase {
    get initialMode() {
        const entry = new ParserStateHandler({
            ...ParserLine.lineParser(l => this.block = l, new ParserStateHandlerEnd()),
            colon: () => ParserStateChange.mode(nonPhpBlock),
            space: () => {},
        })
        const postExpression = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(entry),
            space: () => {},
        })
        const expression = ParserExpression.expressionParser(
            php => this.source = php,
            postExpression
        )
        const nonPhpBlock = new ParserStateHandler({
            bareword_else: () => this.nope,
            bareword_elseif: () => this.nope,
            bareword_endif: () => this.end,
            ...ParserLine.lineParser(l => this.block = l),
        })
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(expression),
            space: () => {},
        })
    }
}
