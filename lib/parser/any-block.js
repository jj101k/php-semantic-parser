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
            "bareword_if",
            "bareword_print",
            "bareword_return",
            "bareword_switch",
            "bareword_throw",
            "bareword_try",
            "bareword_while",
            "bareword_yield",
            "openCurly",
        ]
    }
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {?string} next_mode
     * @returns {ParserBase["modes"]["initial"]}
     */
    static lineParser(f, next_mode = null) {
        const handle_line = () => {
            const l = new ParserLine()
            f(l)
            if(next_mode) {
                return {consumer: l, mode: next_mode, reconsumeLast: 1}
            } else {
                return {consumer: l, reconsumeLast: 1}
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
     * @type {ParserBase["modes"]}
     */
    get modes() {
        /**
         *
         * @param {typeof ParserBase} c
         * @param {?string} m
         */
        const consumer = (c, m = "end") => (() => {
            const node = new c()
            this.nodes.push(node)
            if(m) {
                return {consumer: node, mode: m}
            } else {
                return {consumer: node}
            }
        })
        /**
         *
         * @param {typeof ParserBase} c
         * @param {string} m
         */
        const reconsumer = (c, m = "end") => (() => {
            const node = new c()
            this.nodes.push(node)
            return {consumer: node, mode: m, reconsumeLast: 1}
        })
        const end = () => ({mode: "end", reconsumeLast: 1})
        return {
            else: {
                bareword_if: consumer(ParserIf, "postIf"),
                openCurly: reconsumer(ParserBlock),
                space: () => {},
            },
            initial: {
                ...ParserExpression.expressionParser(node => this.nodes.push(node), "lineEnd"),
                ...ParserBase.commentOrSpace(node => this.nodes.push(node)),
                bareword_break: consumer(ParserBreak),
                bareword_continue: consumer(ParserContinue),
                bareword_do: consumer(ParserDoWhile),
                bareword_echo: consumer(ParserEcho),
                bareword_for: consumer(ParserFor),
                bareword_foreach: consumer(ParserForeach),
                bareword_function: consumer(ParserFunction),
                bareword_if: consumer(ParserIf, "postIf"),
                bareword_print: consumer(ParserPrint),
                bareword_return: consumer(ParserReturn),
                bareword_switch: consumer(ParserSwitch),
                bareword_throw: consumer(ParserThrow),
                bareword_try: consumer(ParserTry, "postTry"),
                bareword_while: consumer(ParserWhile),
                bareword_yield: consumer(ParserYield),
                openCurly: reconsumer(ParserBlock),
            },
            lineEnd: {
                semicolon: () => ({mode: "end"}),
            },
            postIf: {
                ...ParserBase.commentOrSpace(node => this.nodes.push(node)),
                bareword_else: () => ({mode: "else"}),
                bareword_elseif: consumer(ParserIf, null),
                space: () => {},
                $else: end,
            },
            postTry: {
                ...ParserBase.commentOrSpace(node => this.nodes.push(node)),
                bareword_catch: consumer(ParserCatch, null),
                bareword_finally: consumer(ParserBlock, null),
                space: () => {},
                $else: end,
            },
        }
    }
    onEOF() {
        // Do nothing
    }
}

export class ParserAnyBlock {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @returns {ParserBase["modes"]}
     */
    static generalModes(f) {
        return {
            entry: {
                ...ParserBase.commentOrSpace(f),
                ...ParserLine.lineParser(f),
                closeCurly: () => ({mode: "end"}),
                space: () => {},
            },
            initial: {
                openCurly: () => ({mode: "entry"}),
                space: () => {},
            },
        }
    }
}
