import { ParserAnyBlock } from "./any-block"
import { ParserBase } from "./base"
import { ParserClass, ParserTrait } from "./class"
import { ParserStaticExpression } from "./expression"
import { ParserInterface } from "./interface"
import { ParserNamespace } from "./namespace"
import { ParserUseNamespace } from "./use-namespace"

class ParserConst extends ParserBase {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            initial: {
                bareword: c => {
                    this.name = c
                    return {mode: "postConst"}
                },
                space: () => {},
            },
            initialValue: ParserStaticExpression.expressionParser(php => this.valueValue = php, "postValue"),
            postConst: {
                equals: () => ({mode: "initialValue"}),
                space: () => {},
            },
            postValue: {
                semicolon: () => this.end,
                space: () => {},
            },
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
        const class_special = {
            bareword_abstract: () => {
                const php = new ParserClass(true)
                this.nodes.push(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_class: () => {
                const php = new ParserClass()
                this.nodes.push(php)
                return {consumer: php, mode: "entry", reconsumeLast: 1}
            },
            bareword_final: () => {
                const php = new ParserClass(false, true)
                this.nodes.push(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_interface: () => {
                const php = new ParserInterface()
                this.nodes.push(php)
                return { consumer: php }
            },
            bareword_namespace: () => {
                const php = new ParserNamespace()
                this.nodes.push(php)
                return { consumer: php }
            },
            bareword_trait: () => {
                const php = new ParserTrait()
                this.nodes.push(php)
                return {consumer: php}
            },
            bareword_use: () => {
                const php = new ParserUseNamespace()
                this.nodes.push(php)
                return { consumer: php }
            },
        }
        const bareword_const = () => {
            const c = new ParserConst()
            this.nodes.push(c)
            return {consumer: c, mode: "entry"}
        }
        return {
            ...general,
            entry: {
                ...general.entry,
                ...class_special,
                bareword_const,
                $pop: () => this.end,
            },
            initial: {
                ...general.entry,
                ...class_special,
                bareword_const,
                $pop: () => this.end,
            },
            postIf: {
                ...general.postIf,
                ...class_special,
                bareword_const,
                $pop: () => this.end,
            },
        }
    }
    onEOF() {
        // Do nothing
    }
}
