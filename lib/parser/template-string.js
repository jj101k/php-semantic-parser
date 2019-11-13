import { ParserBase } from "./base"
import { ParserString } from "./string"
export class ParserTemplateString extends ParserBase {
    /**
     *
     * @param {boolean} is_static
     */
    constructor(is_static) {
        super()
        this.activeString = ""
        this.isStatic = is_static
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
