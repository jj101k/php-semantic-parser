import { ParserBase } from "./base"
import { ParserPHP } from "./php"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserNamespace extends ParserBase {
    get initialMode() {
        const argument = new ParserStateHandler({
            bareword: c => {
                this.value = c
                return ParserStateChange.mode(postArgument)
            },
            openCurly: () => {
                // Global namespace
                this.block = new ParserPHP()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd()) // This will consume close-curly
            },
        })
        const postArgument = new ParserStateHandler({
            openCurly: () => {
                this.block = new ParserPHP()
                return new ParserStateChange(this.block, new ParserStateHandlerEnd()) // This will consume close-curly
            },
            semicolon: () => ParserStateChange.end,
            space: () => {},
        })
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(argument)
        })
    }
}
