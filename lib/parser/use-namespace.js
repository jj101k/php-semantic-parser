import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"

export class ParserUseNamespace extends ParserBase {
    get modes() {
        return {
            as: {
                bareword: c => {
                    this.as = c
                    return ParserStateChange.mode("postAs")
                },
                space: () => {},
            },
            argument: {
                bareword: c => {
                    this.value = c
                    return ParserStateChange.mode("postArgument")
                },
                bareword_const: () => {this.type = "const"},
                bareword_function: () => {
                    this.type = "function"
                },
                space: () => { }
            },
            initial: {
                space: () => ParserStateChange.mode("argument")
            },
            postArgument: {
                bareword_as: () => ParserStateChange.mode("as"),
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            },
            postAs: {
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            },
        }
    }
}
