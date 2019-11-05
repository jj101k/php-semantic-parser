import { ParserBase } from "./base"
import { ParserString } from "./string"
export class ParserTemplateString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
        this.nodes = []
    }
    get modes() {
        return {
            escape: {
                escapedChar: c => {
                    if(c == "n") {
                        this.activeString += "\n"
                    } else if(c.match(/[A-Z]/)) {
                        this.activeString += `\\${c}`
                    } else {
                        console.log(`Unknown escape \\${c}`)
                        this.activeString += c
                    }
                    return {mode: "initial"}
                },
            },
            initial: {
                escape: () => ({ mode: "escape" }),
                quoteDouble: () => {
                    if(this.activeString.length) {
                        this.nodes.push(new ParserString(this.activeString))
                    }
                    return ({ mode: "end" })
                },
                string: c => { this.activeString += c; },
            },
        }
    }
}
