import { ParserBase } from "./base"
import { ParserInterfaceBody } from "./interface-body"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserInterface extends ParserBase {
    constructor() {
        super()
        this.extends = [] // Interfaces do have multiple inheritance
        this.implements = []
    }
    get initialMode() {
        const handle_body = () => {
            this.body = new ParserInterfaceBody()
            return new ParserStateChange(this.body, new ParserStateHandlerEnd())
        }
        const implementsNext = new ParserStateHandler({
            comma: () => ParserStateChange.mode(phpImplements),
            openCurly: handle_body,
            space: () => {},
        })
        const name = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(postName)
            },
        })
        const phpExtends = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.extends.push(c)
                return ParserStateChange.mode(postExtends)
            },
        })
        const phpImplements = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.implements.push(c)
                return ParserStateChange.mode(implementsNext)
            },
        })
        const postExtends = new ParserStateHandler({
            bareword_implements: () => ParserStateChange.mode(phpImplements),
            comma: () => ParserStateChange.mode(phpExtends),
            openCurly: handle_body,
            space: () => {},
        })
        const postName = new ParserStateHandler({
            ...this.commentOrSpace,
            bareword_extends: () => ParserStateChange.mode(phpExtends),
            bareword_implements: () => ParserStateChange.mode(phpImplements),
            openCurly: handle_body,
        })
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(name),
        })
    }
}
