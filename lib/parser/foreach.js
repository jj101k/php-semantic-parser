import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserVariable } from "./variable"
import { ParserLine } from "./any-block"
import { ParserList, ParserListImplied } from "./list-assignment"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserForeach extends ParserBase {
    get initialMode() {
        const entry = new ParserStateHandler({
            ...ParserLine.lineParser(l => this.block = l, new ParserStateHandlerEnd()),
            colon: () => ParserStateChange.mode(nonPhpBlock),
            space: () => {},
        })
        const initialVariable = new ParserStateHandler({
            ampersand: () => {this.initialPBR = true},
            bareword_list: () => {
                this.loopValue = new ParserList()
                return new ParserStateChange(this.loopValue, postVariable)
            },
            openSquare: () => {
                this.loopValue = new ParserListImplied()
                return new ParserStateChange(this.loopValue, postVariable)
            },
            space: () => {},
            varname: c => {
                this.namespace.set(c, null) // @todo use a separate namespace
                this.loopValue = new ParserVariable(c)
                return ParserStateChange.mode(postInitialVariable)
            },
        })
        const nonPhpBlock = new ParserStateHandler({
            bareword_endforeach: () => this.end,
            ...ParserLine.lineParser(l => this.block = l),
        })
        const postInitialVariable = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(entry),
            fatArrow: () => {
                this.loopKey = this.loopValue
                this.loopValue = undefined
                this.keyPBR = this.initialPBR
                this.initialPBR = undefined
                return ParserStateChange.mode(valueVariable)
            },
            space: () => {},
        })
        const postSource = new ParserStateHandler({
            bareword_as: () => {
                return ParserStateChange.mode(initialVariable)
            },
            space: () => {},
        })
        const postVariable = new ParserStateHandler({
            closeBracket: () => ParserStateChange.mode(entry),
            space: () => {},
        })
        const source = ParserExpression.expressionParser(
            php => this.source = php,
            postSource
        )
        const valueVariable = new ParserStateHandler({
            ampersand: () => {this.valuePBR = true},
            bareword_list: () => {
                this.loopValue = new ParserList()
                return new ParserStateChange(this.loopValue, postVariable)
            },
            space: () => {},
            varname: c => {
                this.namespace.set(c, null) // @todo use a separate namespace
                this.loopValue = new ParserVariable(c)
                return ParserStateChange.mode(postVariable)
            },
        })
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(source),
            space: () => {},
        })
    }
}
