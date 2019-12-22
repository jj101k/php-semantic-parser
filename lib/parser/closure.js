import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserVariable, ParserVariablePBR } from "./variable"
export class ParserClosure extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.uses = []
    }
    get modes() {
        const openCurly = () => {
            this.content = new ParserFunctionBlock()
            return {consumer: this.content, mode: "end", reconsume: true}
        }
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
                colon: () => ({ mode: "returnType" }),
                space: () => { },
                openCurly,
            },
            postReturn: {
                space: () => { },
                openCurly,
            },
            postUseList: {
                colon: () => ({ mode: "returnType" }),
                openCurly,
                space: () => { },
            },
            returnType: {
                bareword: c => {
                    this.returnType = c
                    return { mode: "postReturn" }
                },
                space: () => { },
            },
            useList: {
                openBracket: () => ({mode: "useListInitial"}),
                space: () => { },
            },
            useListAmpersand: {
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariablePBR(c))
                    return {mode: "useListNext"}
                },
            },
            useListInitial: {
                ampersand: () => ({mode: "useListAmpersand"}),
                closeBracket: () => ({ mode: "postUseList" }),
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return {mode: "useListNext"}
                },
            },
            useListLater: {
                ampersand: () => ({mode: "useListAmpersand"}),
                space: () => {},
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

// This is only different in that it does not include $this
export class ParserStaticClosure extends ParserClosure {
}
