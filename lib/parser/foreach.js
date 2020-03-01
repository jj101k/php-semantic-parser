import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserVariable } from "./variable"
import { ParserLine } from "./any-block"
import { ParserList, ParserListImplied } from "./list-assignment"
import { ParserStateChange } from "../parser-state-change"

export class ParserForeach extends ParserBase {
    get modes() {
        return {
            entry: {
                ...ParserLine.lineParser(l => this.block = l, "end"),
                colon: () => ParserStateChange.mode("nonPhpBlock"),
                space: () => {},
            },
            initial: {
                openBracket: () => ParserStateChange.mode("source"),
                space: () => {},
            },
            initialVariable: {
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
            },
            nonPhpBlock: {
                bareword_endforeach: () => this.end,
                ...ParserLine.lineParser(l => this.block = l),
            },
            postInitialVariable: {
                closeBracket: () => ParserStateChange.mode("entry"),
                fatArrow: () => {
                    this.loopKey = this.loopValue
                    this.loopValue = undefined
                    this.keyPBR = this.initialPBR
                    this.initialPBR = undefined
                    return ParserStateChange.mode("valueVariable")
                },
                space: () => {},
            },
            postSource: {
                bareword_as: () => {
                    return ParserStateChange.mode("initialVariable")
                },
                space: () => {},
            },
            postVariable: {
                closeBracket: () => ParserStateChange.mode("entry"),
                space: () => {},
            },
            valueVariable: {
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
            },
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
