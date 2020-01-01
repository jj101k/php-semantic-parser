import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserVariable, ParserAliasedVariable } from "./variable"
import { ParserLine } from "./any-block"

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
                aliasedVarname: c => {
                    this.loopValue = new ParserAliasedVariable(new ParserVariable(c.substring(1)))
                    return {mode: "postInitialVariable"}
                },
                aliasedVarnameStart: () => {
                    const av = new ParserAliasedVariable()
                    this.loopValue = av
                    return {consumer: av, mode: "postInitialVariable"}
                },
                ampersand: () => {this.initialPBR = true},
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
