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
                colon: () => new ParserStateChange(null, "nonPhpBlock"),
                space: () => {},
            },
            initial: {
                openBracket: () => new ParserStateChange(null, "source"),
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
                    return new ParserStateChange(null, "postInitialVariable")
                },
            },
            nonPhpBlock: {
                bareword_endforeach: () => this.end,
                ...ParserLine.lineParser(l => this.block = l),
            },
            postInitialVariable: {
                closeBracket: () => new ParserStateChange(null, "entry"),
                fatArrow: () => {
                    this.loopKey = this.loopValue
                    this.loopValue = undefined
                    this.keyPBR = this.initialPBR
                    this.initialPBR = undefined
                    return new ParserStateChange(null, "valueVariable")
                },
                space: () => {},
            },
            postSource: {
                bareword_as: () => {
                    return new ParserStateChange(null, "initialVariable")
                },
                space: () => {},
            },
            postVariable: {
                closeBracket: () => new ParserStateChange(null, "entry"),
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
                    return new ParserStateChange(null, "postVariable")
                },
            },
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
