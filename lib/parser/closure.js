import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserVariable, ParserVariablePBR } from "./variable"
import { ParserStateChange } from "../parser-state-change"

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
            initial: {
                openBracket: () => {
                    this.arguments = new ParserFunctionArgumentList()
                    return new ParserStateChange(this.arguments, "postArguments")
                },
                space: () => { },
            },
            postArguments: {
                bareword_use: () => ParserStateChange.mode("useList"),
                colon: () => ParserStateChange.mode("returnType"),
                space: () => { },
                openCurly,
            },
            postReturn: {
                space: () => { },
                openCurly,
            },
            postUseList: {
                colon: () => ParserStateChange.mode("returnType"),
                openCurly,
                space: () => { },
            },
            returnType: {
                bareword: c => {
                    this.returnType = c
                    return ParserStateChange.mode("postReturn")
                },
                space: () => { },
            },
            useList: {
                openBracket: () => ParserStateChange.mode("useListInitial"),
                space: () => { },
            },
            useListAmpersand: {
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariablePBR(c))
                    return ParserStateChange.mode("useListNext")
                },
            },
            useListInitial: {
                ampersand: () => ParserStateChange.mode("useListAmpersand"),
                closeBracket: () => ParserStateChange.mode("postUseList"),
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return ParserStateChange.mode("useListNext")
                },
            },
            useListLater: {
                ampersand: () => ParserStateChange.mode("useListAmpersand"),
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return ParserStateChange.mode("useListNext")
                },
            },
            useListNext: {
                closeBracket: () => ParserStateChange.mode("postUseList"),
                comma: () => ParserStateChange.mode("useListLater"),
                space: () => {},
            },
        }
    }
}

// This is only different in that it does not include $this
export class ParserStaticClosure extends ParserClosure {
}
