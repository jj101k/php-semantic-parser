import { ParserBase } from "./base"
export class ParserUse extends ParserBase {
    get modes() {
        return {
            argument: {
                bareword: c => {
                    this.value = c
                    return { mode: "postArgument" }
                },
                bareword_const: () => {
                    this.type = "const"
                },
                bareword_function: () => {
                    this.type = "function"
                },
                space: () => { }
            },
            initial: {
                space: () => ({ mode: "argument" })
            },
            postArgument: {
                semicolon: () => ({ mode: "end" }),
            },
        }
    }
}
