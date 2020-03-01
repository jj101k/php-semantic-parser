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
                bareword_use: () => new ParserStateChange(null, "useList"),
                colon: () => new ParserStateChange(null, "returnType"),
                space: () => { },
                openCurly,
            },
            postReturn: {
                space: () => { },
                openCurly,
            },
            postUseList: {
                colon: () => new ParserStateChange(null, "returnType"),
                openCurly,
                space: () => { },
            },
            returnType: {
                bareword: c => {
                    this.returnType = c
                    return new ParserStateChange(null, "postReturn")
                },
                space: () => { },
            },
            useList: {
                openBracket: () => new ParserStateChange(null, "useListInitial"),
                space: () => { },
            },
            useListAmpersand: {
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariablePBR(c))
                    return new ParserStateChange(null, "useListNext")
                },
            },
            useListInitial: {
                ampersand: () => new ParserStateChange(null, "useListAmpersand"),
                closeBracket: () => new ParserStateChange(null, "postUseList"),
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return new ParserStateChange(null, "useListNext")
                },
            },
            useListLater: {
                ampersand: () => new ParserStateChange(null, "useListAmpersand"),
                space: () => {},
                varname: c => {
                    this.uses.push(new ParserVariable(c))
                    return new ParserStateChange(null, "useListNext")
                },
            },
            useListNext: {
                closeBracket: () => new ParserStateChange(null, "postUseList"),
                comma: () => new ParserStateChange(null, "useListLater"),
                space: () => {},
            },
        }
    }
}

// This is only different in that it does not include $this
export class ParserStaticClosure extends ParserClosure {
}
