import { ParserBase } from "./base"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

class ParserUseAs extends ParserBase {
    get modes() {
        const action = new ParserStateHandler({
            bareword_as: c => {
                this.mode = c
                return ParserStateChange.mode("visibilityOrName")
            },
            bareword_insteadof: c => {
                this.mode = c
                return ParserStateChange.mode("name")
            },
            space: () => {},
        })
        const initial = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode("qualifyOrAction")
            },
            space: () => {},
        })
        const name = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return this.end
            },
            space: () => {},
        })
        const nameOrEnd = new ParserStateHandler({
            bareword: c => {
                this.name = c
                return this.end
            },
            space: () => {},
            $else: () => this.nope,
        })
        const qualify = new ParserStateHandler({
            bareword: c => {
                this.name = [this.name, c]
                return ParserStateChange.mode("action")
            },
        })
        const qualifyOrAction = new ParserStateHandler({
            doubleColon: () => ParserStateChange.mode("qualify"),
            space: () => ParserStateChange.mode("action"),
        })
        const visibilityOrName = new ParserStateHandler({
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
        })
        return {action, initial, name, nameOrEnd, qualify, qualifyOrAction, visibilityOrName}
    }
}

export class ParserUseTrait extends ParserBase {
    constructor() {
        super()
        this.as = []
    }
    get modes() {
        const argument = new ParserStateHandler({
            bareword: c => {
                this.value = c
                return ParserStateChange.mode("postArgument")
            },
            space: () => { }
        })
        const groupAs = new ParserStateHandler({
            bareword: () => {
                const as = new ParserUseAs()
                this.as.push(as)
                return {consumer: as, reconsumeLast: 1, mode: "postAsItem"}
            },
            closeCurly: () => this.end,
            space: () => {},
        })
        const initial = new ParserStateHandler({
            space: () => ParserStateChange.mode("argument")
        })
        const postArgument = new ParserStateHandler({
            openCurly: () => ParserStateChange.mode("groupAs"),
            semicolon: () => this.end,
            space: () => {},
        })
        const postAsItem = new ParserStateHandler({
            closeCurly: () => this.end,
            semicolon: () => ParserStateChange.mode("groupAs"),
            space: () => {},
        })
        return {argument, groupAs, initial, postArgument, postAsItem}
    }
}