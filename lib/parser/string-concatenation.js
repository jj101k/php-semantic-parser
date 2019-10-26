import { ParserBase } from "./base"
import { ParserTemplateString } from "./template-string"
import { ParserVariable } from "./variable"
export class ParserStringConcatenation extends ParserBase {
    constructor(left) {
        super()
        this.left = left
    }
    get modes() {
        return {
            initial: {
                space: () => { },
                quoteDouble: () => {
                    this.right = new ParserTemplateString()
                    return { consumer: this.right, mode: "end" }
                },
                varname: c => {
                    this.right = new ParserVariable(c)
                },
            },
        }
    }
}
