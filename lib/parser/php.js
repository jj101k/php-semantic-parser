import { ParserNamespace } from "./namespace"
import { ParserBase } from "./base"
import { ParserClass } from "./class"
import { ParserAnyBlock } from "./any-block"
import { ParserUse } from "./use"
import { ParserInterface } from "./interface"
export class ParserPHP extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        const general = ParserAnyBlock.generalModes(php => this.nodes.push(php))
        const class_special = {
            bareword_abstract: () => {
                const php = new ParserClass(true)
                this.nodes.push(php)
                return {mode: "classDefinition"}
            },
            bareword_class: () => {
                const php = new ParserClass()
                this.nodes.push(php)
                return { consumer: php }
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
            bareword_use: () => {
                const php = new ParserUse()
                this.nodes.push(php)
                return { consumer: php }
            },
        }
        return Object.assign(
            {},
            general,
            {
                entry: Object.assign({}, general.entry, class_special),
                initial: Object.assign({}, general.entry, class_special),
                classDefinition: {
                    bareword_class: () => ({consumer: this.nodes[this.nodes.length - 1], mode: "entry"}),
                    space: () => { },
                },
            }
        )
    }
    onEOF() {
        // Do nothing
    }
}
