import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserType } from "./type"
import { ParserStateChange } from "../parser-state-change"

export class ParserFunction extends ParserBase {
    constructor() {
        super()
        this.nodes = []
        this.returnByRef = false
    }
    /**
     * @type {ParserBase["modes"][""]}
     */
    get endHunk() {
        return {
            openCurly: () => {
                this.content = new ParserFunctionBlock()
                return new ParserStateChange(this.content, "end", 1)
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
                    return new ParserStateChange(this.arguments, "postArguments")
                },
                space: () => {},
            },
            initial: {
                space: () => new ParserStateChange(null, "name"),
            },
            name: {
                ampersand: () => {this.returnByRef = true},
                bareword: c => {
                    this.name = c
                    return new ParserStateChange(null, "argumentList")
                },
            },
            postArguments: {
                ...this.commentOrSpace,
                colon: () => new ParserStateChange(null, "returnType"),
                ...this.endHunk,
            },
            postReturn: {
                space: () => { },
                ...this.endHunk,
            },
            returnType: {
                bareword: c => {
                    this.returnType = new ParserType()
                    return new ParserStateChange(this.returnType, "postReturn", 1)
                },
                questionMark: c => {
                    this.returnType = new ParserType()
                    return new ParserStateChange(this.returnType, "postReturn", 1)
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
            semicolon: () => this.end,
        }
    }
}