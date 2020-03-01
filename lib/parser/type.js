import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"

export class ParserType extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: {
                bareword: c => {
                    this.type = c
                    return this.end
                },
                questionMark: () => {
                    this.nullable = true
                    return new ParserStateChange(null, "name")
                },
                space: () => {},
            },
            name: {
                bareword: c => {
                    this.type = c
                    return this.end
                },
            },
        }
    }
}