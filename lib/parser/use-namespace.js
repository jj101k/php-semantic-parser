import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserUseNamespace extends ParserBase {
    get initialMode() {
        const argument = new ParserStateHandler({
            bareword: c => {
                this.value = c
                return ParserStateChange.mode(postArgument)
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
                return ParserStateChange.mode(postAs)
            },
            space: () => {},
        })
        const postArgument = new ParserStateHandler({
            bareword_as: () => ParserStateChange.mode(as),
            semicolon: () => ParserStateChange.end,
            space: () => {},
        })
        const postAs = new ParserStateHandler({
            semicolon: () => ParserStateChange.end,
            space: () => {},
        })
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(argument)
        })
    }
}
