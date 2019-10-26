import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
export class ParserFunction extends ParserBase {
    get modes() {
        return {
            argumentList: {
                openBracket: () => {
                    this.arguments = new ParserFunctionArgumentList()
                    return { consumer: this.arguments, mode: "postArguments" }
                },
            },
            initial: {
                space: () => ({ mode: "name" }),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return { mode: "argumentList" }
                },
            },
            postArguments: {
                colon: () => ({ mode: "returnType" }),
            },
            postReturn: {
                openCurly: () => {
                    this.content = new ParserFunctionBlock()
                    return { consumer: this.content, mode: "end" }
                },
                space: () => { },
            },
            returnType: {
                bareword: c => {
                    this.returnType = c
                    return { mode: "postReturn" }
                },
                space: () => { },
            },
        }
    }
    startParse() {
        this.nodes = []
    }
}
