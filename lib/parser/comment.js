import { ParserBase } from "./base"
export class ParserComment extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get modes() {
        return {
            escape: {
                escapedChar: c => {
                    if(c == "n") {
                        this.content += "\n"
                    } else if(c.match(/[A-Z]/)) {
                        this.content += `\\${c}`
                    } else {
                        console.log(`Unknown escape \\${c}`)
                        this.content += c
                    }
                    return {mode: "initial"}
                },
            },
            initial: {
                commentEnd: () => ({ mode: "end" }),
                escape: () => ({ mode: "escape" }),
                string: (c) => { this.content += c; },
            },
        }
    }
}
