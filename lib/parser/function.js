import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
export class ParserFunction extends ParserBase {
    /**
     *
     * @param {boolean} is_abstract
     */
    constructor(is_abstract = false) {
        super()
        this.isAbstract = is_abstract
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const end_hunk = this.isAbstract ?
            {
                semicolon: () => ({mode: "end"}),
            } :
            {
                openCurly: () => {
                    this.content = new ParserFunctionBlock()
                    return {consumer: this.content, mode: "end", reconsume: true}
                },
            }
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
                space: () => { },
                ...end_hunk,
            },
            postReturn: {
                space: () => { },
                ...end_hunk,
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
}
