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
                    return new ParserStateChange(null, "postExtends")
                },
            },
            implements: {
                space: () => {},
                bareword: c => {
                    this.implements.push(c)
                    return new ParserStateChange(null, "implementsNext")
                },
            },
            implementsNext: {
                comma: () => new ParserStateChange(null, "implements"),
                openCurly: handle_body,
                space: () => {},
            },
            initial: {
                space: () => new ParserStateChange(null, "name"),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return new ParserStateChange(null, "postName")
                },
            },
            postExtends: {
                bareword_implements: () => new ParserStateChange(null, "implements"),
                comma: () => new ParserStateChange(null, "extends"),
                openCurly: handle_body,
                space: () => {},
            },
            postName: {
                ...this.commentOrSpace,
                bareword_extends: () => new ParserStateChange(null, "extends"),
                bareword_implements: () => new ParserStateChange(null, "implements"),
                openCurly: handle_body,
            },
        }
    }
}
