import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserLine } from "./any-block"

export class ParserIf extends ParserBase {
    get modes() {
        return {
            entry: {
                ...ParserLine.lineParser(l => this.block = l, "end"),
                colon: () => ({mode: "nonPhpBlock"}),
                space: () => {},
            },
            initial: {
                openBracket: () => ({ mode: "expression" }),
                space: () => {},
            },
            nonPhpBlock: {
                bareword_else: () => ({mode: "end", reconsumeLast: 1}),
                bareword_elseif: () => ({mode: "end", reconsumeLast: 1}),
                bareword_endif: () => ({mode: "end"}),
                ...ParserLine.lineParser(l => this.block = l),
            },
            postExpression: {
                closeBracket: () => ({mode: "entry"}),
                space: () => {},
            },
            expression: ParserExpression.expressionParser(
                php => this.source = php,
                "postExpression"
            ),
        }
    }
}
