import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserAnyBlock } from "./any-block"
export class ParserBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                bareword: c => {
                    const php = ParserAnyBlock.barewordHandler(c)
                    if(!php) {
                        throw new Error(`Unknown bareword ${c}`)
                    }
                    this.nodes.push(php)
                    return { consumer: php }
                },
                closeCurly: () => ({ mode: "end" }),
                comment: () => {
                    const php = new ParserComment()
                    this.nodes.push(php)
                    return { consumer: php }
                },
                space: () => { },
            },
        }
    }
}
