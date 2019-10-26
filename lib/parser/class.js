import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"
export class ParserClass extends ParserBase {
    get modes() {
        return {
            name: {
                bareword: c => {
                    this.name = c
                    return { mode: "postName" }
                },
            },
            initial: {
                space: () => ({ mode: "name" })
            },
            postName: {
                openCurly: () => {
                    this.body = new ParserClassBody()
                    return {consumer: this.body, mode: "end"}
                },
                space: () => {},
            },
        }
    }
}
