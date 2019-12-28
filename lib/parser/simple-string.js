import { ParserBase } from "./base"

export class ParserSimpleString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
    }
    get modes() {
        return {
            escape: {
                $pop: c => {
                    if(c == "'") {
                        this.activeString += "'"
                    } else {
                        this.activeString += `\\${c}`
                    }
                    return {mode: "initial"}
                },
            },
            initial: {
                $pop: () => ({mode: "end"}),
                escape: () => ({ mode: "escape" }),
                string: c => { this.activeString += c },
            },
        }
    }
}
