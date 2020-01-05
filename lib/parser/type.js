import { ParserBase } from "./base"

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
                    return {mode: "name"}
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