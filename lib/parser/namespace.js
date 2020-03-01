import { ParserBase } from "./base"
import { ParserPHP } from "./php"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserNamespace extends ParserBase {
    get modes() {
        return {
            argument: new ParserStateHandler({
                bareword: c => {
                    this.value = c
                    return ParserStateChange.mode("postArgument")
                },
                openCurly: () => {
                    // Global namespace
                    this.block = new ParserPHP()
                    return new ParserStateChange(this.block, "end") // This will consume close-curly
                },
            }),
            initial: new ParserStateHandler({
                space: () => ParserStateChange.mode("argument")
            }),
            postArgument: new ParserStateHandler({
                openCurly: () => {
                    this.block = new ParserPHP()
                    return new ParserStateChange(this.block, "end") // This will consume close-curly
                },
                semicolon: () => ParserStateChange.mode("end"),
                space: () => {},
            }),
        }
    }
}
