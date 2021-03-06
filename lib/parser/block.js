import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"

export class ParserBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        return ParserAnyBlock.generalModes(php => this.nodes.push(php))
    }
}
