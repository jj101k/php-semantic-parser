import { ParserBase } from "./base"

class ParserUseAs extends ParserBase {
    get modes() {
        return {
            action: {
                bareword_as: c => {
                    this.mode = c
                    return {mode: "name"}
                },
                bareword_insteadof: c => {
                    this.mode = c
                    return {mode: "name"}
                },
                space: () => {},
            },
            initial: {
                bareword: c => {
                    this.name = c
                    return {mode: "qualifyOrAction"}
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
            qualify: {
                bareword: c => {
                    this.name = [this.name, c]
                    return {mode: "action"}
                },
            },
            qualifyOrAction: {
                doubleColon: () => ({mode: "qualify"}),
                space: () => ({mode: "action"}),
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
                    return {mode: "postArgument"}
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
                space: () => ({mode: "argument"})
            },
            postArgument: {
                openCurly: () => ({mode: "groupAs"}),
                semicolon: () => this.end,
                space: () => {},
            },
            postAsItem: {
                closeCurly: () => this.end,
                semicolon: () => ({mode: "groupAs"}),
                space: () => {},
            },
        }
    }
}