import { ParserBase } from "./base"
import { ParserClassBody } from "./class-body"
export class ParserClass extends ParserBase {
    /**
     *
     * @param {boolean} is_abstract
     */
    constructor(is_abstract = false) {
        super()
        this.isAbstract = is_abstract
    }
    get modes() {
        return {
            extends: {
                space: () => {},
                bareword: c => {
                    this.extends = c
                    return { mode: "postExtends" }
                },
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
                openCurly: () => {
                    this.body = new ParserClassBody()
                    return {consumer: this.body, mode: "end"}
                },
                space: () => {},
            },
            postName: {
                bareword_extends: () => ({mode: "extends"}),
                openCurly: () => {
                    this.body = new ParserClassBody()
                    return {consumer: this.body, mode: "end"}
                },
                space: () => {},
            },
        }
    }
}
