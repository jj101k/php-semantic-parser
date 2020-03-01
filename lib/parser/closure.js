import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserVariable, ParserVariablePBR } from "./variable"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserClosure extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.uses = []
    }
    get modes() {
        const openCurly = () => {
            this.content = new ParserFunctionBlock()
            return new ParserStateChange(this.content, "end", 1)
        }
        return {
            initial: new ParserStateHandler({
                openBracket: () => {
                    this.arguments = new ParserFunctionArgumentList()
                    return new ParserStateChange(this.arguments, "postArguments")
                },
                space: () => { },
            }),
            postArguments: new ParserStateHandler({
                bareword_use: () => ParserStateChange.mode("useList"),
                colon: () => ParserStateChange.mode("returnType"),
                space: () => { },
                openCurly,
            }),
            postReturn: new ParserStateHandler({
                space: () => { },
                openCurly,
            }),
            postUseList: new ParserStateHandler({
                colon: () => ParserStateChange.mode("returnType"),
                openCurly,
                space: () => { },
            }),
            returnType: new ParserStateHandler({
                bareword: c => {
                    this.returnType = c
                    return ParserStateChange.mode("postReturn")
                },
                space: () => { },
            }),
            useList: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("useListInitial"),
                space: () => { },
            }),
            useListAmpersand: new ParserStateHandler({
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariablePBR(c))
                    return ParserStateChange.mode("useListNext")
                },
            }),
            useListInitial: new ParserStateHandler({
                ampersand: () => ParserStateChange.mode("useListAmpersand"),
                closeBracket: () => ParserStateChange.mode("postUseList"),
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return ParserStateChange.mode("useListNext")
                },
            }),
            useListLater: new ParserStateHandler({
                ampersand: () => ParserStateChange.mode("useListAmpersand"),
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return ParserStateChange.mode("useListNext")
                },
            }),
            useListNext: new ParserStateHandler({
                closeBracket: () => ParserStateChange.mode("postUseList"),
                comma: () => ParserStateChange.mode("useListLater"),
                space: () => {},
            }),
        }
    }
}

// This is only different in that it does not include $this
export class ParserStaticClosure extends ParserClosure {
}
