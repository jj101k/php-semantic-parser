import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"
import { ParserFunctionCall } from "./function-call"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

class ParserAnyClass extends ParserBase {
    /**
     *
     */
    constructor() {
        super()
        this.implements = []
    }
}

export class ParserClass extends ParserAnyClass {
    /**
     *
     * @param {boolean} is_abstract
     * @param {boolean} is_final
     */
    constructor(is_abstract = false, is_final = false) {
        super()
        this.isAbstract = is_abstract
        this.isFinal = is_final
        this.implements = []
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const bareword_extends = () => ParserStateChange.mode(inExtends)
        const bareword_implements = () => ParserStateChange.mode(inImplements)
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, new ParserStateHandlerEnd())
        }
        const inExtends = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.extends = c
                return ParserStateChange.mode(postExtends)
            },
        })
        const inImplements = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.implements.push(c)
                return ParserStateChange.mode(implementsNext)
            },
        })
        const implementsNext = new ParserStateHandler({
            comma: () => ParserStateChange.mode(inImplements),
            openCurly,
            space: () => {},
        })
        const info = new ParserStateHandler({
            bareword_extends,
            bareword_implements,
            openCurly,
            space: () => {},
        })
        const postExtends = new ParserStateHandler({
            bareword_implements,
            openCurly,
            space: () => {},
        })
        const name = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(info)
            },
            space: () => {},
        })
        return new ParserStateHandler({
            bareword_class: () => ParserStateChange.mode(name),
            space: () => {},
        })
    }
}

export class ParserAnonymousClass extends ParserAnyClass {
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const bareword_extends = () => ParserStateChange.mode(inExtends)
        const bareword_implements = () => ParserStateChange.mode(inImplements)
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, new ParserStateHandlerEnd())
        }
        const inExtends = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.extends = c
                return ParserStateChange.mode(postExtends)
            },
        })
        const inImplements = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.implements.push(c)
                return ParserStateChange.mode(implementsNext)
            },
        })
        const openBracket = () => {
            this.arguments = new ParserFunctionCall([this, "new"])
            return new ParserStateChange(this.arguments, preCurly)
        }
        const implementsNext = new ParserStateHandler({
            comma: () => ParserStateChange.mode(inImplements),
            openCurly,
            space: () => {},
            openBracket,
        })
        const info = new ParserStateHandler({
            bareword_extends,
            bareword_implements,
            openCurly,
            space: () => {},
            openBracket,
        })
        const postExtends = new ParserStateHandler({
            bareword_implements,
            openCurly,
            space: () => {},
            openBracket,
        })
        const preCurly = new ParserStateHandler({
            openCurly,
            space: () => {},
        })
        return new ParserStateHandler({
            bareword_class: () => ParserStateChange.mode(info),
        })
    }
}

export class ParserTrait extends ParserBase {
    get initialMode() {
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, new ParserStateHandlerEnd())
        }
        const postName = new ParserStateHandler({
            openCurly,
            space: () => {},
        })
        return new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(postName)
            },
            space: () => {},
        })
    }
}