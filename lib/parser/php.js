import { ParserNamespace } from "./namespace"
import { ParserBase } from "./base"
import { ParserComment } from "./comment"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"
import { ParserClass } from "./class"
export class ParserPHP extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword: c => {
                    let php
                    if(c == "class") {
                        php = new ParserClass()
                    } else if(c == "echo") {
                        php = new ParserEcho()
                    } else if(c == "function") {
                        php = new ParserFunction()
                    } else if(c == "namespace") {
                        php = new ParserNamespace()
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
    onEOF() {
        // Do nothing
    }
    startParse() {
        this.nodes = []
    }
}
