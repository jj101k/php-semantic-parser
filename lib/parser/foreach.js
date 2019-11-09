import { ParserBase } from "./base"
import { ParserVariable } from "./variable"
import { ParserBlock } from "./block"
import { ParserExpression } from "./expression"
export class ParserForeach extends ParserBase {
    get modes() {
        return {
            initial: {
                openBracket: () => ({ mode: "source" }),
            },
            initialVariable: {
                space: () => {},
                varname: c => {
                    this.loopValue = new ParserVariable(c)
                    return {mode: "postInitialVariable"}
                },
            },
            postInitialVariable: {
                fatArrow: () => {
                    this.loopKey = this.loopValue
                    this.loopValue = undefined
                    return {mode: "valueVariable"}
                },
                space: () => {},
            },
            postSetup: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "end", reconsume: true}
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
