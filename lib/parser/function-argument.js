import { ParserBase } from "./base"
export class ParserFunctionArgument extends ParserBase {
    get modes() {
        return {
            initial: {
                bareword: c => {
                    this.type = c
                    return { mode: "name" }
                },
                varname: c => {
                    this.name = c
                    return { mode: "end" }
                },
            },
            name: {
                space: () => { },
                varname: c => {
                    this.name = c
                    return { mode: "end" }
                },
            },
        }
    }
}
