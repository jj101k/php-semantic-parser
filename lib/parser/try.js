import { ParserBase } from "./base"
import { ParserBlock } from "./block"
export class ParserTry extends ParserBase {
    get modes() {
        return {
            initial: {
                space: () => {},
                openCurly: () => {
                    this.block = new ParserBlock()
                    return {consumer: this.block, mode: "end", reconsume: true}
                },
            },
        }
    }
}
