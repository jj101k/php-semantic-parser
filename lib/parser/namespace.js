import { ParserBase } from "./base"
import { ParserPHP } from "./php"

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
                openCurly: () => {
                    this.block = new ParserPHP()
                    return {consumer: this.block, mode: "end"} // This will consume close-curly
                },
                semicolon: () => ({ mode: "end" }),
                space: () => {},
            },
        }
    }
}
