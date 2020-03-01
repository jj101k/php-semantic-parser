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
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const bareword_extends = () => ParserStateChange.mode("extends")
        const bareword_implements = () => ParserStateChange.mode("implements")
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, "end")
        }
        return {
            extends: new ParserStateHandler({
                space: () => {},
                bareword: c => {
                    this.extends = c
                    return ParserStateChange.mode("postExtends")
                },
            }),
            implements: new ParserStateHandler({
                space: () => {},
                bareword: c => {
                    this.implements.push(c)
                    return ParserStateChange.mode("implementsNext")
                },
            }),
            implementsNext: new ParserStateHandler({
                comma: () => ParserStateChange.mode("implements"),
                openCurly,
                space: () => {},
            }),
            info: new ParserStateHandler({
                bareword_extends,
                bareword_implements,
                openCurly,
                space: () => {},
            }),
            initial: new ParserStateHandler({}),
            postExtends: new ParserStateHandler({
                bareword_implements,
                openCurly,
                space: () => {},
            }),
            preCurly: new ParserStateHandler({
                openCurly,
                space: () => {},
            }),
        }
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
        return {
            ...super.modes,
            initial: new ParserStateHandler({
                bareword_class: () => ParserStateChange.mode("name"),
                space: () => {},
            }),
            name: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return ParserStateChange.mode("info")
                },
                space: () => {},
            }),
        }
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
        return {
            ...super.modes,
            info: new ParserStateHandler({
                ...super.modes.info.handlers,
                openBracket,
            }),
            implementsNext: new ParserStateHandler({
                ...super.modes.implementsNext.handlers,
                openBracket,
            }),
            postExtends: new ParserStateHandler({
                ...super.modes.postExtends.handlers,
                openBracket,
            }),
            initial: new ParserStateHandler({
                bareword_class: () => ParserStateChange.mode("info"),
            }),
        }
    }
}

export class ParserTrait extends ParserBase {
    get modes() {
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, "end")
        }
        return {
            initial: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return ParserStateChange.mode("postName")
                },
                space: () => {},
            }),
            postName: new ParserStateHandler({
                openCurly,
                space: () => {},
            }),
        }
    }
}