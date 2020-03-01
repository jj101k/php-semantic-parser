import { ParserBase } from "./base"
import { ParserInterfaceBody } from "./interface-body"
import { ParserStateChange } from "../parser-state-change"

export class ParserInterface extends ParserBase {
    constructor() {
        super()
        this.extends = [] // Interfaces do have multiple inheritance
        this.implements = []
    }
    get modes() {
        const handle_body = () => {
            this.body = new ParserInterfaceBody()
            return new ParserStateChange(this.body, "end")
        }
        return {
            extends: {
                space: () => {},
                bareword: c => {
                    this.extends.push(c)
                    return ParserStateChange.mode("postExtends")
                },
            },
            implements: {
                space: () => {},
                bareword: c => {
                    this.implements.push(c)
                    return ParserStateChange.mode("implementsNext")
                },
            },
            implementsNext: {
                comma: () => ParserStateChange.mode("implements"),
                openCurly: handle_body,
                space: () => {},
            },
            initial: {
                space: () => ParserStateChange.mode("name"),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return ParserStateChange.mode("postName")
                },
            },
            postExtends: {
                bareword_implements: () => ParserStateChange.mode("implements"),
                comma: () => ParserStateChange.mode("extends"),
                openCurly: handle_body,
                space: () => {},
            },
            postName: {
                ...this.commentOrSpace,
                bareword_extends: () => ParserStateChange.mode("extends"),
                bareword_implements: () => ParserStateChange.mode("implements"),
                openCurly: handle_body,
            },
        }
    }
}
