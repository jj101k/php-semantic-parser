import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserNamespace } from "./namespace"
import { ParserUseNamespace } from "./use-namespace"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

class ParserConst extends ParserBase {
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const postConst = new ParserStateHandler({
            equals: () => ParserStateChange.mode(initialValue),
            space: () => {},
        })
        const postValue = new ParserStateHandler({
            semicolon: () => this.end,
            space: () => {},
        })
        const initialValue = ParserStaticExpression.expressionParser(php => this.valueValue = php, postValue)
        return new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(postConst)
            },
            space: () => {},
        })
    }
}
export class ParserPHP extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        return ParserAnyBlock.initialEntry(
            php => this.nodes.push(php),
            entry => {
                const bareword_const = () => {
                    const c = new ParserConst()
                    this.nodes.push(c)
                    return new ParserStateChange(c, entry)
                }
                const bareword_namespace = () => {
                    const php = new ParserNamespace()
                    this.nodes.push(php)
                    return new ParserStateChange(php)
                }
                const bareword_use = () => {
                    const php = new ParserUseNamespace()
                    this.nodes.push(php)
                    return new ParserStateChange(php)
                }
                return {
                    bareword_const,
                    bareword_namespace,
                    bareword_use,
                    $pop: () => this.end,
                }
            }
        )
    }
    onEOF() {
        // Do nothing
    }
}
