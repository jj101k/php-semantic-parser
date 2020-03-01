import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserUseNamespace extends ParserBase {
    get modes() {
        return {
            as: new ParserStateHandler({
                bareword: c => {
                    this.as = c
                    return ParserStateChange.mode("postAs")
                },
                space: () => {},
            }),
            argument: new ParserStateHandler({
                bareword: c => {
                    this.value = c
                    return ParserStateChange.mode("postArgument")
                },
                bareword_const: () => {this.type = "const"},
                bareword_function: () => {
                    this.type = "function"
                },
                space: () => { }
            }),
            initial: new ParserStateHandler({
                space: () => ParserStateChange.mode("argument")
            }),
            postArgument: new ParserStateHandler({
                bareword_as: () => ParserStateChange.mode("as"),
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            }),
            postAs: new ParserStateHandler({
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            }),
        }
    }
}
