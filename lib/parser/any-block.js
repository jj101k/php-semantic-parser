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

export class ParserAnyBlock {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @returns {ParserBase["modes"]}
     */
    static generalModes(f) {
        const entry = {
            ...ParserExpression.expressionParser(f, "lineEnd"),
            ...ParserBase.commentOrSpace(f),
            bareword_break: () => {
                const php = new ParserBreak()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_do: () => {
                const php = new ParserDoWhile()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_echo: () => {
                const php = new ParserEcho()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_for: () => {
                const php = new ParserFor()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_foreach: () => {
                const php = new ParserForeach()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_function: () => {
                const php = new ParserFunction()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_if: () => {
                const php = new ParserIf()
                f(php)
                return {consumer: php, mode: "postIf"}
            },
            bareword_print: () => {
                const php = new ParserPrint()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_return: () => {
                const php = new ParserReturn()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_switch: () => {
                const php = new ParserSwitch()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_throw: () => {
                const php = new ParserThrow()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_try: () => {
                const php = new ParserTry()
                f(php)
                return {consumer: php, mode: "postTry"}
            },
            bareword_while: () => {
                const php = new ParserWhile()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            bareword_yield: () => {
                const php = new ParserYield()
                f(php)
                return {consumer: php, mode: "entry"}
            },
            closeCurly: () => ({ mode: "end" }),
        }
        return {
            entry: entry,
            else: {
                bareword_if: () => {
                    const node = new ParserIf()
                    f(node)
                    return {consumer: node, mode: "postIf"}
                },
                openCurly: () => {
                    const node = new ParserBlock()
                    f(node)
                    return {consumer: node, mode: "entry", reconsumeLast: 1}
                },
                space: () => {},
            },
            initial: {
                openCurly: () => ({mode: "entry"}),
                space: () => { },
            },
            lineEnd: {
                semicolon: () => ({mode: "entry"}),
            },
            postIf: {
                bareword_else: () => ({mode: "else"}),
                bareword_elseif: () => {
                    const node = new ParserIf()
                    f(node)
                    return {consumer: node}
                },
                ...entry,
            },
            postTry: {
                bareword_catch: () => {
                    const node = new ParserCatch()
                    f(node)
                    return {consumer: node}
                },
                bareword_finally: () => {
                    const node = new ParserBlock()
                    f(node)
                    return {consumer: node}
                },
                ...entry,
            },
        }
    }
}