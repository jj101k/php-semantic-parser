import { ParserNamespace } from "./namespace"
import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserClass } from "./class"
import { ParserAnyBlock } from "./any-block"
export class ParserPHP extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                bareword: c => {
                    let php = ParserAnyBlock.barewordHandler(c)
                    if(!php) {
                        if(c == "class") {
                            php = new ParserClass()
                        } else if(c == "namespace") {
                            php = new ParserNamespace()
                        } else {
                            throw new Error(`Unknown bareword ${c}`)
                        }
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
    onEOF() {
        // Do nothing
    }
}
