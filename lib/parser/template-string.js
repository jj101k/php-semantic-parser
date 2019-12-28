import { ParserBase } from "./base"
import { ParserString } from "./string"

export class ParserStaticTemplateString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                escapedCharacter: c => {
                    this.activeString += ParserString.escapeCharacter(c)
                },
                $pop: () => {
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

export class ParserTemplateString extends ParserStaticTemplateString {
}
