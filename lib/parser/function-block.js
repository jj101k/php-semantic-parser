import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserGlobalRef extends ParserBase {
    constructor() {
        super()
        this.name = null
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: {
                space: () => ({mode: "name"}),
            },
            name: {
                varname: c => {
                    this.name = c
                    return {mode: "postName"}
                },
            },
            postName: {
                semicolon: () => ({mode: "end"}),
            },
        }
    }
}
export class ParserFunctionBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const general_modes = ParserAnyBlock.generalModes(php => this.nodes.push(php))
        const bareword_global = () => {
            const g = new ParserGlobalRef()
            this.nodes.push(g)
            return {consumer: g, mode: "entry"}
        }
        const bareword_static = () => ({mode: "staticSymbolOrRef"})
        return {
            ...general_modes,
            entry: {
                ...general_modes.entry,
                bareword_global,
                bareword_static,
            },
            initial: {
                ...general_modes.initial,
                bareword_global,
                bareword_static,
            },
            staticSymbolOrRef: {
                ...general_modes.staticSymbolOrRef,
                varname: () => {
                    const e = new ParserExpression()
                    e.isStaticDeclaration = true
                    this.nodes.push(e)
                    return {consumer: e, mode: "lineEnd", reconsumeLast: 1}
                },
                bareword_function: () => {
                    const e = new ParserExpression()
                    this.nodes.push(e)
                    return {consumer: e, mode: "lineEnd", reconsumeLast: 3}
                },
                doubleColon: () => {
                    const e = new ParserExpression()
                    this.nodes.push(e)
                    return {consumer: e, mode: "lineEnd", reconsumeLast: 2}
                },
                space: () => {},
            },
        }
    }
}
