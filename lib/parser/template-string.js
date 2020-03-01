import { ParserBase } from "./base"
import { ParserString } from "./string"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

export class ParserStaticTemplateString extends ParserBase {
    constructor() {
        super()
        this.activeString = ""
        this.nodes = []
    }
    get modes() {
        return {
            initial: {
                escapedCharacter: c => {
                    this.activeString += ParserString.escapeCharacter(c)
                },
                $pop: () => {
                    if(this.activeString.length) {
                        this.nodes.push(new ParserString(this.activeString))
                    }
                    return new ParserStateChange(null, "end")
                },
                string: c => { this.activeString += c; },
            },
        }
    }
}

export class ParserTemplateString extends ParserStaticTemplateString {
    get modes() {
        const s = super.modes
        return {
            ...s,
            initial: {
                ...s.initial,
                interpolation: () => {
                    this.nodes.push(new ParserString(this.activeString))
                    this.activeString = ""
                    const e = new ParserExpression()
                    this.nodes.push(e)
                    return {consumer: e, reconsumeLast: 1, mode: "postInterpolation"}
                },
            },
            postInterpolation: {
                $pop: () => new ParserStateChange(null, "initial"),
            },
        }
    }
}

export class ParserBackquoteString extends ParserTemplateString {
}
