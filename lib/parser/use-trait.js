import { ParserBase } from "./base"

export class ParserUseTrait extends ParserBase {
    get modes() {
        return {
            argument: {
                bareword: c => {
                    this.value = c
                    return {mode: "postArgument"}
                },
                space: () => { }
            },
            initial: {
                space: () => ({mode: "argument"})
            },
            postArgument: {
                semicolon: () => ({mode: "end"}),
                space: () => {},
            },
        }
    }
}