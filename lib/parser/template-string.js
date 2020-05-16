import { ParserBase } from "./base"
import { ParserString } from "./string"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

export class ParserStaticTemplateString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
        this.nodes = []
    }
    get initialMode() {
        return new ParserStateHandler({
            escapedCharacter: c => {
                this.activeString += ParserString.escapeCharacter(c)
            },
            $pop: () => {
                if(this.activeString.length) {
                    this.nodes.push(new ParserString(this.activeString))
                }
                return ParserStateChange.end
            },
            string: c => { this.activeString += c; },
        })
    }
}

export class ParserTemplateString extends ParserStaticTemplateString {
    get initialMode() {
        const initial = new ParserStateHandler({
            escapedCharacter: c => {
                this.activeString += ParserString.escapeCharacter(c)
            },
            $pop: () => {
                if(this.activeString.length) {
                    this.nodes.push(new ParserString(this.activeString))
                }
                return ParserStateChange.end
            },
            string: c => { this.activeString += c; },
            interpolation: () => {
                this.nodes.push(new ParserString(this.activeString))
                this.activeString = ""
                const e = new ParserExpression()
                this.nodes.push(e)
                return {consumer: e, reconsumeLast: 1, mode: postInterpolation}
            },
        })
        const postInterpolation = new ParserStateHandler({
            $pop: () => ParserStateChange.mode(initial),
        })
        return initial
    }
}

export class ParserBackquoteString extends ParserTemplateString {
}
