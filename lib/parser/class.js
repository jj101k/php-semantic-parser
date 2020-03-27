import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"
import { ParserFunctionCall } from "./function-call"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

class ParserAnyClass extends ParserBase {
    /**
     *
     */
    constructor() {
        super()
        this.implements = []
    }
    /**
     * @protected
     */
    get infoModes() {
        const bareword_extends = () => ParserStateChange.mode("inExtends")
        const bareword_implements = () => ParserStateChange.mode("inImplements")
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, "end")
        }
        const inExtends = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.extends = c
                return ParserStateChange.mode("postExtends")
            },
        })
        const inImplements = new ParserStateHandler({
            space: () => {},
            bareword: c => {
                this.implements.push(c)
                return ParserStateChange.mode("implementsNext")
            },
        })
        const implementsNext = new ParserStateHandler({
            comma: () => ParserStateChange.mode("inImplements"),
            openCurly,
            space: () => {},
        })
        const info = new ParserStateHandler({
            bareword_extends,
            bareword_implements,
            openCurly,
            space: () => {},
        })
        const initial = new ParserStateHandler({})
        const postExtends = new ParserStateHandler({
            bareword_implements,
            openCurly,
            space: () => {},
        })
        return {inExtends, inImplements, implementsNext, info, initial, postExtends}
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
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const initial = new ParserStateHandler({
            bareword_class: () => ParserStateChange.mode("name"),
            space: () => {},
        })
        const name = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode("info")
            },
            space: () => {},
        })
        return {...super.infoModes, initial, name}
    }
}

export class ParserAnonymousClass extends ParserAnyClass {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const openBracket = () => {
            this.arguments = new ParserFunctionCall([this, "new"])
            return new ParserStateChange(this.arguments, "preCurly")
        }
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, "end")
        }
        const implementsNext = new ParserStateHandler({
            ...super.modes.implementsNext.handlers,
            openBracket,
        })
        const info = new ParserStateHandler({
            ...super.modes.info.handlers,
            openBracket,
        })
        const initial = new ParserStateHandler({
            bareword_class: () => ParserStateChange.mode("info"),
        })
        const postExtends = new ParserStateHandler({
            ...super.modes.postExtends.handlers,
            openBracket,
        })
        const preCurly = new ParserStateHandler({
            openCurly,
            space: () => {},
        })
        return {...super.infoModes, implementsNext, info, initial, postExtends, preCurly}
    }
}

export class ParserTrait extends ParserBase {
    get modes() {
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, "end")
        }
        const initial = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode("postName")
            },
            space: () => {},
        })
        const postName = new ParserStateHandler({
            openCurly,
            space: () => {},
        })
        return {initial, postName}
    }
}