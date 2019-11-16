import { ParserBase } from "./base"
import { ParserInterfaceBody } from "./interface-body"
export class ParserInterface extends ParserBase {
    constructor() {
        super()
        this.implements = []
    }
    get modes() {
        const handle_body = () => {
            this.body = new ParserInterfaceBody()
            return {consumer: this.body, mode: "end"}
        }
        return {
            extends: {
                space: () => {},
                bareword: c => {
                    this.extends = c
                    return { mode: "postExtends" }
                },
            },
            implements: {
                space: () => {},
                bareword: c => {
                    this.implements.push(c)
                    return {mode: "implementsNext"}
                },
            },
            implementsNext: {
                comma: () => ({mode: "implements"}),
                openCurly: handle_body,
                space: () => {},
            },
            initial: {
                space: () => ({ mode: "name" }),
            },
            name: {
                bareword: c => {
                    this.name = c
                    return { mode: "postName" }
                },
            },
            postExtends: {
                bareword_implements: () => ({mode: "implements"}),
                openCurly: handle_body,
                space: () => {},
            },
            postName: {
                bareword_extends: () => ({mode: "extends"}),
                bareword_implements: () => ({mode: "implements"}),
                openCurly: handle_body,
                space: () => {},
            },
        }
    }
}