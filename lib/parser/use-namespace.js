import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"

export class ParserUseNamespace extends ParserBase {
    get modes() {
        return {
            as: {
                bareword: c => {
                    this.as = c
                    return new ParserStateChange(null, "postAs")
                },
                space: () => {},
            },
            argument: {
                bareword: c => {
                    this.value = c
                    return new ParserStateChange(null, "postArgument")
                },
                bareword_const: () => {this.type = "const"},
                bareword_function: () => {
                    this.type = "function"
                },
                space: () => { }
            },
            initial: {
                space: () => new ParserStateChange(null, "argument")
            },
            postArgument: {
                bareword_as: () => new ParserStateChange(null, "as"),
                semicolon: () => new ParserStateChange(null, "end"),
                space: () => {},
            },
            postAs: {
                semicolon: () => new ParserStateChange(null, "end"),
                space: () => {},
            },
        }
    }
}
