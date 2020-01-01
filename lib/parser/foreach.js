import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserVariable } from "./variable"
import { ParserAnyBlock, ParserLine } from "./any-block"

export class ParserForeach extends ParserBase {
    get modes() {
        return {
            entry: {
                ...ParserLine.lineParser(l => this.block = l, "end"),
                space: () => {},
            },
            initial: {
                openBracket: () => ({ mode: "source" }),
                space: () => {},
            },
            initialVariable: {
                ampersand: () => {this.initialPBR = true},
                space: () => {},
                varname: c => {
                    this.loopValue = new ParserVariable(c)
                    return {mode: "postInitialVariable"}
                },
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
