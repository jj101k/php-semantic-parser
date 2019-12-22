import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"
export class ParserClass extends ParserBase {
    /**
     *
     * @param {boolean} is_abstract
     * @param {boolean} is_final
     * @param {boolean} is_anonymous
     */
    constructor(is_abstract = false, is_final = false, is_anonymous = false) {
        super()
        this.isAbstract = is_abstract
        this.isFinal = is_final
        this.implements = []

        this.isAnonymous = is_anonymous
    }
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
            initial: this.isAnonymous ? {
                bareword_extends,
                bareword_implements,
                openCurly,
                space: () => {},
            } : {
                bareword: c => {
                    this.name = c
                    return {mode: "postName"}
                },
                space: () => {},
            },
            postExtends: {
                bareword_implements,
                openCurly,
                space: () => {},
            },
            postName: {
                bareword_extends,
                bareword_implements,
                openCurly,
                space: () => {},
            },
        }
    }
}
