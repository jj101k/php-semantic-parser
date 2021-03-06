import { ParserBase } from "./base"
import { ParserBlock } from "./block"
import { ParserBreak } from "./break"
import { ParserCatch } from "./catch"
import { ParserEcho } from "./echo"
import { ParserExpression } from "./expression"
import { ParserFor } from "./for"
import { ParserForeach } from "./foreach"
import { ParserFunction } from "./function"
import { ParserIf } from "./if"
import { ParserPrint } from "./print"
import { ParserReturn } from "./return"
import { ParserSwitch } from "./switch"
import { ParserThrow } from "./throw"
import { ParserTry } from "./try"
import { ParserDoWhile, ParserWhile } from "./while"
import { ParserYield } from "./yield"
import { ParserContinue } from "./continue"
import { ParserClass, ParserTrait } from "./class"
import { ParserInterface } from "./interface"
import { ParserGoto } from "./goto"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserGlobalRef extends ParserBase {
    constructor() {
        super()
        this.name = null
    }
    get initialMode() {
        const postName = new ParserStateHandler({
            semicolon: () => this.end,
        })
        const postCurly = new ParserStateHandler({
            closeCurly: () => ParserStateChange.mode(postName),
        })
        const name = new ParserStateHandler({
            aliasedVarnameStart: () => {
                this.nameRef = new ParserExpression()
                return new ParserStateChange(this.nameRef, postCurly)
            },
            varname: c => {
                this.name = c
                this.namespace.set(c, null)
                return ParserStateChange.mode(postName)
            },
        })
        return new ParserStateHandler({
            space: () => ParserStateChange.mode(name),
        })
    }
}

class ParserNonPhp extends ParserBase {
    constructor() {
        super()
        this.content = ""
    }
    get initialMode() {
        return new ParserStateHandler({
            php: c => {
                this.content += c.substring(0, c.length - "<?php".length)
                return this.end
            },
            $other: c => {
                this.content += c
            },
        })
    }
    onEOF() {
        // That's fine
    }
}

/**
 * This encapsulates parsing a single line. It's not meaningful on its own, it's
 * here to provide parsing structure.
 */
export class ParserLine extends ParserBase {
    static get initialTokens() {
        return [
            ...ParserExpression.initialTokens,
            "bareword_break",
            "bareword_continue",
            "bareword_do",
            "bareword_echo",
            "bareword_for",
            "bareword_foreach",
            "bareword_function",
            "bareword_global",
            "bareword_goto",
            "bareword_if",
            "bareword_print",
            "bareword_return",
            "bareword_switch",
            "bareword_throw",
            "bareword_try",
            "bareword_while",
            "bareword_yield",
            "openCurly",
            "semicolon",
            "$pop",
        ]
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {?ParserStateHandler} next_mode
     * @returns {ParserBase["initialMode"]["handlers"]}
     */
    static lineParser(f, next_mode = null) {
        const handle_line = () => {
            const l = new ParserLine()
            f(l)
            if(next_mode) {
                return new ParserStateChange(l, next_mode, 1)
            } else {
                return new ParserStateChange(l, null, 1)
            }
        }
        const parser = ParserBase.commentOrSpace(() => {})
        for(const t of this.initialTokens) {
            parser[t] = handle_line
        }

        return parser
    }
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        /**
         *
         * @param {typeof ParserBase} c
         * @param {?ParserStateHandler} m
         */
        const consumer = (c, m = new ParserStateHandlerEnd()) => (() => {
            const node = new c()
            this.nodes.push(node)
            if(m) {
                return new ParserStateChange(node, m)
            } else {
                return new ParserStateChange(node)
            }
        })
        /**
         *
         * @param {typeof ParserBase} c
         * @param {ParserStateHandler} m
         */
        const reconsumer = (c, m = new ParserStateHandlerEnd()) => (() => {
            const node = new c()
            this.nodes.push(node)
            return new ParserStateChange(node, m, 1)
        })
        const end = () => this.nope
        const condElse = new ParserStateHandler({
            ...ParserLine.lineParser(node => this.nodes.push(node), new ParserStateHandlerEnd()),
            colon: () => ParserStateChange.mode(nonPhpElse),
            space: () => {},
        })
        const lineEnd = new ParserStateHandler({
            semicolon: () => this.end,
            $pop: consumer(ParserNonPhp),
        })
        const lineEndOrMoreStatic = new ParserStateHandler({
            comma: () => ParserStateChange.mode(staticVar),
            semicolon: () => this.end,
            $pop: consumer(ParserNonPhp),
        })
        const nonPhpElse = new ParserStateHandler({
            bareword_else: () => ParserStateChange.mode(condElse),
            bareword_endif: () => this.end,
            ...ParserLine.lineParser(node => this.nodes.push(node)),
        })
        const possibleLabel = new ParserStateHandler({
            colon: () => {
                this.label = this.possibleLabel
                this.possibleLabel = undefined
                return ParserStateChange.mode(initial)
            },
            $else: () => {
                const e = new ParserExpression()
                this.nodes.push(e)
                return {consumer: e, reconsumeLast: 2, mode: lineEnd}
            },
        })
        const postIf = new ParserStateHandler({
            ...ParserBase.commentOrSpace(node => this.nodes.push(node)),
            bareword_else: () => ParserStateChange.mode(condElse),
            bareword_elseif: consumer(ParserIf, null),
            space: () => {},
            $else: end,
        })
        const postTry = new ParserStateHandler({
            ...ParserBase.commentOrSpace(node => this.nodes.push(node)),
            bareword_catch: consumer(ParserCatch, null),
            bareword_finally: consumer(ParserBlock, null),
            space: () => {},
            $else: end,
        })
        const varname = c => {
            this.namespace.set(c, null) // Can be declared without an assignment
            const e = new ParserExpression()
            e.isStaticDeclaration = true
            this.nodes.push(e)
            return new ParserStateChange(e, lineEndOrMoreStatic, 1)
        }
        const staticSymbolOrRef = new ParserStateHandler({
            bareword_function: () => {
                const e = new ParserExpression()
                this.nodes.push(e)
                return new ParserStateChange(e, new ParserStateHandlerEnd(), 3)
            },
            doubleColon: () => {
                const e = new ParserExpression()
                this.nodes.push(e)
                return new ParserStateChange(e, new ParserStateHandlerEnd(), 2)
            },
            space: () => {},
            varname,
        })
        const staticVar = new ParserStateHandler({
            space: () => {},
            varname,
        })
        const initial = new ParserStateHandler({
            ...ParserExpression.expressionParser(node => this.nodes.push(node), lineEnd).handlers,
            ...ParserBase.commentOrSpace(node => this.nodes.push(node)),
            bareword: c => {
                this.possibleLabel = c
                return ParserStateChange.mode(possibleLabel)
            },
            bareword_break: consumer(ParserBreak),
            bareword_continue: consumer(ParserContinue),
            bareword_do: consumer(ParserDoWhile),
            bareword_echo: consumer(ParserEcho),
            bareword_for: consumer(ParserFor),
            bareword_foreach: consumer(ParserForeach),
            bareword_function: consumer(ParserFunction),
            bareword_global: consumer(ParserGlobalRef),
            bareword_goto: consumer(ParserGoto),
            bareword_if: consumer(ParserIf, postIf),
            bareword_print: consumer(ParserPrint),
            bareword_return: consumer(ParserReturn),
            bareword_static: () => ParserStateChange.mode(staticSymbolOrRef),
            bareword_switch: consumer(ParserSwitch),
            bareword_throw: consumer(ParserThrow),
            bareword_try: consumer(ParserTry, postTry),
            bareword_while: consumer(ParserWhile),
            bareword_yield: consumer(ParserYield),
            closeCurly: () => this.nope, // Can happen after a label
            openCurly: reconsumer(ParserBlock),
            semicolon: () => this.end,
            $pop: consumer(ParserNonPhp),
        })
        return initial
    }
    onEOF() {
        // Do nothing
    }
}

export class ParserAnyBlock {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {?(entry: ParserStateHandler) => ParserStateHandler["handlers"]} extra_entry_handlers
     * @returns {ParserBase["initialMode"]}
     */
    static generalModes(f, extra_entry_handlers = null) {
        const entry = this.initialEntry(f, extra_entry_handlers)
        return new ParserStateHandler({
            openCurly: () => ParserStateChange.mode(entry),
            space: () => {},
        })
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {?(entry: ParserStateHandler) => ParserStateHandler["handlers"]} extra_entry_handlers
     * @returns {ParserBase["initialMode"]}
     */
    static initialEntry(f, extra_entry_handlers = null) {
        const entry = new ParserStateHandler({
            ...ParserBase.commentOrSpace(f),
            ...ParserLine.lineParser(f),
            bareword_abstract: () => {
                const php = new ParserClass(true)
                f(php)
                return new ParserStateChange(php)
            },
            bareword_class: () => { // This can appear inside a block
                const php = new ParserClass()
                f(php)
                return new ParserStateChange(php, null, 1)
            },
            bareword_final: () => {
                const php = new ParserClass(false, true)
                f(php)
                return new ParserStateChange(php)
            },
            bareword_interface: () => {
                const php = new ParserInterface()
                f(php)
                return new ParserStateChange(php)
            },
            bareword_trait: () => {
                const php = new ParserTrait()
                f(php)
                return new ParserStateChange(php)
            },
            closeCurly: () => ParserStateChange.end,
            space: () => {},
        })
        if(extra_entry_handlers) {
            entry.handlers = {
                ...entry.handlers,
                ...extra_entry_handlers(entry),
            }
        }
        return entry
    }
}
