import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
import { ParserVariable } from "./variable"

export class ParserForeach extends ParserBase {
    get modes() {
        return {
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
                closeBracket: () => ({mode: "postSetup"}),
                fatArrow: () => {
                    this.loopKey = this.loopValue
                    this.loopValue = undefined
                    this.keyPBR = this.initialPBR
                    this.initialPBR = undefined
                    return {mode: "valueVariable"}
                },
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "end", reconsumeLast: 1}
                },
            },
            postSource: {
                bareword_as: () => {
                    return {mode: "initialVariable"}
                },
                space: () => {},
            },
            postVariable: {
                closeBracket: () => ({mode: "postSetup"}),
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
