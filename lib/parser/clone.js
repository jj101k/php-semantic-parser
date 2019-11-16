import { ParserBase } from "./base"
export class ParserClone extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                space: () => ({ mode: "argument" }),
            },
            argument: {
                varname: c => {this.variable = c; return {mode: "end"}}
            },
        }
    }
}
