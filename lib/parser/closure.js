import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserVariable } from "./variable"
export class ParserClosure extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.uses = []
    }
    get modes() {
        return {
            initial: {
                openBracket: () => {
                    this.arguments = new ParserFunctionArgumentList()
                    return { consumer: this.arguments, mode: "postArguments" }
                },
                space: () => { },
            },
            postArguments: {
                bareword_use: () => ({mode: "useList"}),
                space: () => { },
                openCurly: () => {
                    this.content = new ParserFunctionBlock()
                    return {consumer: this.content, mode: "end", reconsume: true}
                },
            },
            postUseList: {
                space: () => { },
                openCurly: () => {
                    this.content = new ParserFunctionBlock()
                    return {consumer: this.content, mode: "end", reconsume: true}
                },
            },
            useList: {
                openBracket: () => ({mode: "useListInitial"}),
                space: () => { },
            },
            useListInitial: {
                closeBracket: () => ({ mode: "postUseList" }),
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return {mode: "useListNext"}
                },
            },
            useListLater: {
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return {mode: "useListNext"}
                },
            },
            useListNext: {
                closeBracket: () => ({ mode: "postUseList" }),
                comma: () => ({ mode: "useListLater" }),
            },
        }
    }
}
