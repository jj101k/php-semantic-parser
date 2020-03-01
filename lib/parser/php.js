import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserClass, ParserTrait } from "./class"
import { ParserStaticExpression } from "./expression"
import { ParserInterface } from "./interface"
import { ParserNamespace } from "./namespace"
import { ParserUseNamespace } from "./use-namespace"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

class ParserConst extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: new ParserStateHandler({
                bareword: c => {
                    this.name = c
                    return ParserStateChange.mode("postConst")
                },
                space: () => {},
            }),
            initialValue: ParserStaticExpression.expressionParser(php => this.valueValue = php, "postValue"),
            postConst: new ParserStateHandler({
                equals: () => ParserStateChange.mode("initialValue"),
                space: () => {},
            }),
            postValue: new ParserStateHandler({
                semicolon: () => this.end,
                space: () => {},
            }),
        }
    }
}
export class ParserPHP extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        const general = ParserAnyBlock.generalModes(php => this.nodes.push(php))
        const bareword_const = () => {
            const c = new ParserConst()
            this.nodes.push(c)
            return new ParserStateChange(c, "entry")
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
            ...general,
            entry: new ParserStateHandler({
                ...general.entry.handlers,
                bareword_const,
                bareword_namespace,
                bareword_use,
                $pop: () => this.end,
            }),
            initial: new ParserStateHandler({
                $else: () => ParserStateChange.mode("entry"),
            }),
        }
    }
    onEOF() {
        // Do nothing
    }
}
