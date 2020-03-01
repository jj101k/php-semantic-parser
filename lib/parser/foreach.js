import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserVariable } from "./variable"
import { ParserLine } from "./any-block"
import { ParserList, ParserListImplied } from "./list-assignment"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserForeach extends ParserBase {
    get modes() {
        return {
            entry: new ParserStateHandler({
                ...ParserLine.lineParser(l => this.block = l, "end"),
                colon: () => ParserStateChange.mode("nonPhpBlock"),
                space: () => {},
            }),
            initial: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("source"),
                space: () => {},
            }),
            initialVariable: new ParserStateHandler({
                ampersand: () => {this.initialPBR = true},
                bareword_list: () => {
                    this.loopValue = new ParserList()
                    return new ParserStateChange(this.loopValue, "postVariable")
                },
                openSquare: () => {
                    this.loopValue = new ParserListImplied()
                    return new ParserStateChange(this.loopValue, "postVariable")
                },
                space: () => {},
                varname: c => {
                    this.loopValue = new ParserVariable(c)
                    return ParserStateChange.mode("postInitialVariable")
                },
            }),
            nonPhpBlock: new ParserStateHandler({
                bareword_endforeach: () => this.end,
                ...ParserLine.lineParser(l => this.block = l),
            }),
            postInitialVariable: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("entry"),
                fatArrow: () => {
                    this.loopKey = this.loopValue
                    this.loopValue = undefined
                    this.keyPBR = this.initialPBR
                    this.initialPBR = undefined
                    return ParserStateChange.mode("valueVariable")
                },
                space: () => {},
            }),
            postSource: new ParserStateHandler({
                bareword_as: () => {
                    return ParserStateChange.mode("initialVariable")
                },
                space: () => {},
            }),
            postVariable: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("entry"),
                space: () => {},
            }),
            valueVariable: new ParserStateHandler({
                ampersand: () => {this.valuePBR = true},
                bareword_list: () => {
                    this.loopValue = new ParserList()
                    return new ParserStateChange(this.loopValue, "postVariable")
                },
                space: () => {},
                varname: c => {
                    this.loopValue = new ParserVariable(c)
                    return ParserStateChange.mode("postVariable")
                },
            }),
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
