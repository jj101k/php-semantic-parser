import { ParserBase } from "./base"
export class ParserSimpleString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
    }
    get modes() {
        return {
            escape: {
                escapedChar: c => {
                    if(c == "'") {
                        this.activeString += "'"
                    } else {
                        this.activeString += `\\${c}`
                    }
                    return {mode: "initial"}
                },
            },
            initial: {
                endnowdoc: () => ({mode: "end"}),
                escape: () => ({ mode: "escape" }),
                quoteSingle: () => ({mode: "end"}),
                string: c => { this.activeString += c },
            },
        }
    }
}
