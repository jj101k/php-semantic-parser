import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserUseNamespace extends ParserBase {
    get modes() {
        const argument = new ParserStateHandler({
            bareword: c => {
                this.value = c
                return ParserStateChange.mode("postArgument")
            },
            bareword_const: () => {this.type = "const"},
            bareword_function: () => {
                this.type = "function"
            },
            space: () => { }
        })
        const as = new ParserStateHandler({
            bareword: c => {
                this.as = c
                return ParserStateChange.mode("postAs")
            },
            space: () => {},
        })
        const initial = new ParserStateHandler({
            space: () => ParserStateChange.mode("argument")
        })
        const postArgument = new ParserStateHandler({
            bareword_as: () => ParserStateChange.mode("as"),
            semicolon: () => ParserStateChange.mode("end"),
            space: () => {},
        })
        const postAs = new ParserStateHandler({
            semicolon: () => ParserStateChange.mode("end"),
            space: () => {},
        })
        return {argument, as, initial, postArgument, postAs}
    }
}
