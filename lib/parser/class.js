import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"
import { ParserFunctionCall } from "./function-call"
import { ParserStateChange } from "../parser-state-change"

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
        const bareword_extends = () => new ParserStateChange(null, "extends")
        const bareword_implements = () => new ParserStateChange(null, "implements")
        const openCurly = () => {
            this.body = new ParserClassBody()
            return new ParserStateChange(this.body, "end")
        }
        return {
            extends: {
                space: () => {},
                bareword: c => {
                    this.extends = c
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
                openCurly,
                space: () => {},
            },
            info: {
                bareword_extends,
                bareword_implements,
                openCurly,
                space: () => {},
            },
            initial: {},
            postExtends: {
                bareword_implements,
                openCurly,
                space: () => {},
            },
            preCurly: {
                openCurly,
                space: () => {},
            },
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
            initial: {
                bareword_class: () => new ParserStateChange(null, "name"),
                space: () => {},
            },
            name: {
                bareword: c => {
                    this.name = c
                    return new ParserStateChange(null, "info")
                },
                space: () => {},
            },
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
            info: {
                ...super.modes.info,
                openBracket,
            },
            implementsNext: {
                ...super.modes.implementsNext,
                openBracket,
            },
            postExtends: {
                ...super.modes.postExtends,
                openBracket,
            },
            initial: {
                bareword_class: () => new ParserStateChange(null, "info"),
            },
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
            initial: {
                bareword: c => {
                    this.name = c
                    return new ParserStateChange(null, "postName")
                },
                space: () => {},
            },
            postName: {
                openCurly,
                space: () => {},
            },
        }
    }
}