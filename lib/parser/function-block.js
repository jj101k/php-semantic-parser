import { ParserBase } from "./base"
import { ParserAnyBlock } from "./any-block"
import { ParserVariable } from "./variable"

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
        return {
            ...general_modes,
            entry: {
                ...general_modes.entry,
                bareword_global,
            },
            initial: {
                ...general_modes.initial,
                bareword_global,
            },
            staticSymbolOrRef: {
                ...general_modes.staticSymbolOrRef,
                varname: c => {
                    this.nodes.push(new ParserVariable(c, true))
                    return {mode: "postArgument"}
                },
            },
        }
    }
}
