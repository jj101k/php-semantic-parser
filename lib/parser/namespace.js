import { ParserBase } from "./base"
export class ParserNamespace extends ParserBase {
    get modes() {
        return {
            argument: {
                bareword: c => {
                    this.value = c
                    return { mode: "postArgument" }
                },
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
