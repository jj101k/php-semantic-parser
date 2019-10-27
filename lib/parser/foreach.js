import { ParserBase } from "./base"
import { ParserVariable } from "./variable"
import { ParserBlock } from "./block"
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
                    return {consumer: this.block, mode: "end"}
                },
            },
            postSource: {
                bareword: c => {
                    if(c == "as") {
                        return {mode: "initialVariable"}
                    } else {
                        throw new Error(`Unexpected bareword ${c}`)
                    }
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
            source: {
                varname: c => {
                    this.source = new ParserVariable(c)
                    return {mode: "postSource"}
                }
            },
        }
    }
}
