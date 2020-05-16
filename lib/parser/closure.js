import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserVariable, ParserVariablePBR } from "./variable"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserClosure extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.uses = []
    }
    get initialMode() {
        const openCurly = () => {
            this.content = new ParserFunctionBlock()
            return new ParserStateChange(this.content, new ParserStateHandlerEnd(), 1)
        }
        const postArguments = new ParserStateHandler({
            bareword_use: () => ParserStateChange.mode(useList),
            colon: () => ParserStateChange.mode(returnType),
            space: () => { },
            openCurly,
        })
        const postReturn = new ParserStateHandler({
            space: () => { },
            openCurly,
        })
        const postUseList = new ParserStateHandler({
            colon: () => ParserStateChange.mode(returnType),
            openCurly,
            space: () => { },
        })
        const returnType = new ParserStateHandler({
            bareword: c => {
                this.returnType = c
                return ParserStateChange.mode(postReturn)
            },
            space: () => { },
        })
        const useList = new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(useListInitial),
            space: () => { },
        })
        const useListAmpersand = new ParserStateHandler({
            space: () => {},
            varname: c => {
                this.uses.push(new ParserVariablePBR(c))
                return ParserStateChange.mode(useListNext)
            },
        })
        const useListInitial = new ParserStateHandler({
            ampersand: () => ParserStateChange.mode(useListAmpersand),
            closeBracket: () => ParserStateChange.mode(postUseList),
            space: () => {},
            varname: c => {
                this.uses.push(new ParserVariable(c))
                return ParserStateChange.mode(useListNext)
            },
        })
        const useListLater = new ParserStateHandler({
            ampersand: () => ParserStateChange.mode(useListAmpersand),
            space: () => {},
            varname: c => {
                this.uses.push(new ParserVariable(c))
                return ParserStateChange.mode(useListNext)
            },
        })
        const useListNext = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(postUseList),
            comma: () => ParserStateChange.mode(useListLater),
            space: () => {},
        })
        return new ParserStateHandler({
            openBracket: () => {
                this.arguments = new ParserFunctionArgumentList()
                return new ParserStateChange(this.arguments, postArguments)
            },
            space: () => { },
        })
    }
}

// This is only different in that it does not include $this
export class ParserStaticClosure extends ParserClosure {
}
