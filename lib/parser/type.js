import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserType extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: new ParserStateHandler({
                bareword: c => {
                    this.type = c
                    return this.end
                },
                questionMark: () => {
                    this.nullable = true
                    return ParserStateChange.mode("name")
                },
                space: () => {},
            }),
            name: new ParserStateHandler({
                bareword: c => {
                    this.type = c
                    return this.end
                },
            }),
        }
    }
}