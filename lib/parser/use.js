import { ParserBase } from "./base"
export class ParserUse extends ParserBase {
    get modes() {
        return {
            as: {
                bareword: c => {
                    this.as = c
                    return { mode: "postAs" }
                },
                space: () => {},
            },
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
                bareword_as: () => ({mode: "as"}),
                semicolon: () => ({ mode: "end" }),
                space: () => {},
            },
            postAs: {
                semicolon: () => ({ mode: "end" }),
                space: () => {},
            },
        }
    }
}
