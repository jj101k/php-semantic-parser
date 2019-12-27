import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
export class ParserFunction extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"][""]}
     */
    get endHunk() {
        return {
            openCurly: () => {
                this.content = new ParserFunctionBlock()
                return {consumer: this.content, mode: "end", reconsumeLast: 1}
            },
        }
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            argumentList: {
                openBracket: () => {
                    this.arguments = new ParserFunctionArgumentList()
                    return {consumer: this.arguments, mode: "postArguments"}
                },
            },
            initial: {
                space: () => ({mode: "name"}),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return {mode: "argumentList"}
                },
            },
            postArguments: {
                colon: () => ({mode: "returnType"}),
                space: () => {},
                ...this.endHunk,
            },
            postReturn: {
                space: () => { },
                ...this.endHunk,
            },
            returnType: {
                bareword: c => {
                    this.returnType = c
                    return {mode: "postReturn"}
                },
                space: () => {},
            },
        }
    }
}

export class ParserAbstractFunction extends ParserFunction {
        /**
     * @type {ParserBase["modes"][""]}
     */
    get endHunk() {
        return {
            semicolon: () => ({mode: "end"}),
        }
    }
}