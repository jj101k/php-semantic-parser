import { ParserBase } from "./base"

export class ParserSimpleString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
    }
    get modes() {
        return {
            initial: {
                $pop: () => ({mode: "end"}),
                escapedCharacter: c => {
                    if(c == "\\'") {
                        this.activeString += "'"
                    } else {
                        this.activeString += c
                    }
                },
                string: c => { this.activeString += c },
            },
        }
    }
}
