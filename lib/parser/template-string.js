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
            escape: {
                "-pop": c => {
                    this.activeString += ParserString.escapeCharacter(c)
                    return {mode: "initial"}
                },
            },
            initial: {
                escape: () => ({ mode: "escape" }),
                "-pop": () => {
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
