import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"
export class ParserFunctionBlock extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                bareword: c => {
                    let php
                    if(c == "echo") {
                        php = new ParserEcho()
                    } else if(c == "function") {
                        php = new ParserFunction()
                    } else {
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
