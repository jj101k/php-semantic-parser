import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserVariable } from "./variable"
import { ParserLine } from "./any-block"
import { ParserList, ParserListImplied } from "./list-assignment"

export class ParserForeach extends ParserBase {
    get modes() {
        return {
            entry: {
                ...ParserLine.lineParser(l => this.block = l, "end"),
                colon: () => ({mode: "nonPhpBlock"}),
                space: () => {},
            },
            initial: {
                openBracket: () => ({ mode: "source" }),
                space: () => {},
            },
            initialVariable: {
                ampersand: () => {this.initialPBR = true},
                bareword_list: () => {
                    this.loopValue = new ParserList()
                    return {consumer: this.loopValue, mode: "postVariable"}
                },
                openSquare: () => {
                    this.loopValue = new ParserListImplied()
                    return {consumer: this.loopValue, mode: "postVariable"}
                },
                space: () => {},
                varname: c => {
                    this.loopValue = new ParserVariable(c)
                    return {mode: "postInitialVariable"}
                },
            },
            nonPhpBlock: {
                bareword_endforeach: () => ({mode: "end"}),
                ...ParserLine.lineParser(l => this.block = l),
            },
            postInitialVariable: {
                closeBracket: () => ({mode: "entry"}),
                fatArrow: () => {
                    this.loopKey = this.loopValue
                    this.loopValue = undefined
                    this.keyPBR = this.initialPBR
                    this.initialPBR = undefined
                    return {mode: "valueVariable"}
                },
                space: () => {},
            },
            postSource: {
                bareword_as: () => {
                    return {mode: "initialVariable"}
                },
                space: () => {},
            },
            postVariable: {
                closeBracket: () => ({mode: "entry"}),
                space: () => {},
            },
            valueVariable: {
                ampersand: () => {this.valuePBR = true},
                bareword_list: () => {
                    this.loopValue = new ParserList()
                    return {consumer: this.loopValue, mode: "postVariable"}
                },
                space: () => {},
                varname: c => {
                    this.loopValue = new ParserVariable(c)
                    return {mode: "postVariable"}
                },
            },
            source: ParserExpression.expressionParser(
                php => this.source = php,
                "postSource"
            ),
        }
    }
}
