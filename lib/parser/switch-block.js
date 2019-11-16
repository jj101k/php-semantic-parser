import { ParserBase } from "./base"
import { ParserAnyBlock } from "./any-block"
export class ParserSwitchBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return ParserAnyBlock.generalModes(php => this.nodes.push(php))
    }
}
