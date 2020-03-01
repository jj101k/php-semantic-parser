import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

class ParserUseAs extends ParserBase {
    get modes() {
        return {
            action: new ParserStateHandler({
                bareword_as: c => {
                    this.mode = c
                    return ParserStateChange.mode("visibilityOrName")
                },
                bareword_insteadof: c => {
                    this.mode = c
                    return ParserStateChange.mode("name")
                },
                space: () => {},
            }),
            initial: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return ParserStateChange.mode("qualifyOrAction")
                },
                space: () => {},
            }),
            name: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return this.end
                },
                space: () => {},
            }),
            nameOrEnd: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return this.end
                },
                space: () => {},
                $else: () => this.nope,
            }),
            qualify: new ParserStateHandler({
                bareword: c => {
                    this.name = [this.name, c]
                    return ParserStateChange.mode("action")
                },
            }),
            qualifyOrAction: new ParserStateHandler({
                doubleColon: () => ParserStateChange.mode("qualify"),
                space: () => ParserStateChange.mode("action"),
            }),
            visibilityOrName: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return this.end
                },
                bareword_private: c => {
                    this.visibility = c
                    return ParserStateChange.mode("nameOrEnd")
                },
                bareword_protected: c => {
                    this.visibility = c
                    return ParserStateChange.mode("nameOrEnd")
                },
                bareword_public: c => {
                    this.visibility = c
                    return ParserStateChange.mode("nameOrEnd")
                },
                space: () => {},
            }),
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
            argument: new ParserStateHandler({
                bareword: c => {
                    this.value = c
                    return ParserStateChange.mode("postArgument")
                },
                space: () => { }
            }),
            groupAs: new ParserStateHandler({
                bareword: () => {
                    const as = new ParserUseAs()
                    this.as.push(as)
                    return {consumer: as, reconsumeLast: 1, mode: "postAsItem"}
                },
                closeCurly: () => this.end,
                space: () => {},
            }),
            initial: new ParserStateHandler({
                space: () => ParserStateChange.mode("argument")
            }),
            postArgument: new ParserStateHandler({
                openCurly: () => ParserStateChange.mode("groupAs"),
                semicolon: () => this.end,
                space: () => {},
            }),
            postAsItem: new ParserStateHandler({
                closeCurly: () => this.end,
                semicolon: () => ParserStateChange.mode("groupAs"),
                space: () => {},
            }),
        }
    }
}