import { ParserBase } from "./base"
import { ParserPHP } from "./php"
import { ParserStateChange } from "../parser-state-change"

export class ParserNamespace extends ParserBase {
    get modes() {
        return {
            argument: {
                bareword: c => {
                    this.value = c
                    return new ParserStateChange(null, "postArgument")
                },
                openCurly: () => {
                    // Global namespace
                    this.block = new ParserPHP()
                    return new ParserStateChange(this.block, "end") // This will consume close-curly
                },
            },
            initial: {
                space: () => new ParserStateChange(null, "argument")
            },
            postArgument: {
                openCurly: () => {
                    this.block = new ParserPHP()
                    return new ParserStateChange(this.block, "end") // This will consume close-curly
                },
                semicolon: () => new ParserStateChange(null, "end"),
                space: () => {},
            },
        }
    }
}
