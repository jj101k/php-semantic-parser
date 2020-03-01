import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"

class ParserUseAs extends ParserBase {
    get modes() {
        return {
            action: {
                bareword_as: c => {
                    this.mode = c
                    return new ParserStateChange(null, "visibilityOrName")
                },
                bareword_insteadof: c => {
                    this.mode = c
                    return new ParserStateChange(null, "name")
                },
                space: () => {},
            },
            initial: {
                bareword: c => {
                    this.name = c
                    return new ParserStateChange(null, "qualifyOrAction")
                },
                space: () => {},
            },
            name: {
                bareword: c => {
                    this.name = c
                    return this.end
                },
                space: () => {},
            },
            nameOrEnd: {
                bareword: c => {
                    this.name = c
                    return this.end
                },
                space: () => {},
                $else: () => this.nope,
            },
            qualify: {
                bareword: c => {
                    this.name = [this.name, c]
                    return new ParserStateChange(null, "action")
                },
            },
            qualifyOrAction: {
                doubleColon: () => new ParserStateChange(null, "qualify"),
                space: () => new ParserStateChange(null, "action"),
            },
            visibilityOrName: {
                bareword: c => {
                    this.name = c
                    return this.end
                },
                bareword_private: c => {
                    this.visibility = c
                    return new ParserStateChange(null, "nameOrEnd")
                },
                bareword_protected: c => {
                    this.visibility = c
                    return new ParserStateChange(null, "nameOrEnd")
                },
                bareword_public: c => {
                    this.visibility = c
                    return new ParserStateChange(null, "nameOrEnd")
                },
                space: () => {},
            },
        }
    }
}

export class ParserUseTrait extends ParserBase {
    constructor() {
        super()
        this.as = []
    }
    get modes() {
        return {
            argument: {
                bareword: c => {
                    this.value = c
                    return new ParserStateChange(null, "postArgument")
                },
                space: () => { }
            },
            groupAs: {
                bareword: () => {
                    const as = new ParserUseAs()
                    this.as.push(as)
                    return {consumer: as, reconsumeLast: 1, mode: "postAsItem"}
                },
                closeCurly: () => this.end,
                space: () => {},
            },
            initial: {
                space: () => new ParserStateChange(null, "argument")
            },
            postArgument: {
                openCurly: () => new ParserStateChange(null, "groupAs"),
                semicolon: () => this.end,
                space: () => {},
            },
            postAsItem: {
                closeCurly: () => this.end,
                semicolon: () => new ParserStateChange(null, "groupAs"),
                space: () => {},
            },
        }
    }
}