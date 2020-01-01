import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"

export class ParserFunctionBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return ParserAnyBlock.generalModes(php => this.nodes.push(php))
    }
}
