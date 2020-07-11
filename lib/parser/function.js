import { ParserBase } from "./base"
import { ParserFunctionArgumentList } from "./function-argument-list"
import { ParserFunctionBlock } from "./function-block"
import { ParserType } from "./type"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"
import { NamespaceVariable } from "../namespace/variable"

export class ParserFunction extends ParserBase {
    constructor() {
        super()
        this.namespace = new NamespaceVariable()
        this.nodes = []
        this.returnByRef = false

        this.namespace.set("$this", null) // @todo limit to class and non-static
    }
    /**
     * @type {ParserBase["initialMode"]["handlers"]}
     */
    get endHunk() {
        return {
            openCurly: () => {
                this.content = new ParserFunctionBlock()
                return new ParserStateChange(this.content, new ParserStateHandlerEnd(), 1)
            },
        }
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const argumentList = new ParserStateHandler({
            openBracket: () => {
                this.arguments = new ParserFunctionArgumentList()
                return new ParserStateChange(this.arguments, postArguments)
            },
            space: () => {},
        })
        const name = new ParserStateHandler({
            ampersand: () => {this.returnByRef = true},
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(argumentList)
            },
        })
        const postArguments = new ParserStateHandler({
            ...this.commentOrSpace,
            colon: () => ParserStateChange.mode(returnType),
            ...this.endHunk,
        })
        const postReturn = new ParserStateHandler({
            space: () => { },
            ...this.endHunk,
        })
        const returnType = new ParserStateHandler({
            bareword: c => {
                this.returnType = new ParserType()
                return new ParserStateChange(this.returnType, postReturn, 1)
            },
            questionMark: c => {
                this.returnType = new ParserType()
                return new ParserStateChange(this.returnType, postReturn, 1)
            },
            space: () => {},
        })
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(name),
        })
    }
    /**
     *
     * @param {NamespaceVariable} nv
     */
    setParentNamespace(nv) {
        // No-op
    }
}

export class ParserAbstractFunction extends ParserFunction {
    /**
     * @type {ParserBase["initialMode"]["handlers"]}
     */
    get endHunk() {
        return {
            semicolon: () => this.end,
        }
    }
}