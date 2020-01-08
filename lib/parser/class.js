import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"

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
        const bareword_extends = () => ({mode: "extends"})
        const bareword_implements = () => ({mode: "implements"})
        const openCurly = () => {
            this.body = new ParserClassBody()
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
                openCurly,
                space: () => {},
            },
            initial: {},
            postExtends: {
                bareword_implements,
                openCurly,
                space: () => {},
            },
            info: {
                bareword_extends,
                bareword_implements,
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
                bareword: c => {
                    this.name = c
                    return {mode: "info"}
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
        return {
            ...super.modes,
            initial: {
                $else: () => ({mode: "info", reconsumeLast: 1}),
            },
        }
    }
}

export class ParserTrait extends ParserBase {
    get modes() {
        const openCurly = () => {
            this.body = new ParserClassBody()
            return {consumer: this.body, mode: "end"}
        }
        return {
            initial: {
                bareword: c => {
                    this.name = c
                    return {mode: "postName"}
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