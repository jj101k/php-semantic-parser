import { ParserBase } from "./base"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"
import { ParserForeach } from "./foreach"
import { ParserSwitch } from "./switch"
import { ParserThrow } from "./throw"
import { ParserReturn } from "./return"
import { ParserIf } from "./if"
import { ParserBlock } from "./block"
import { ParserWhile } from "./while"
import { ParserExpression } from "./expression"
import { ParserTry } from "./try"
import { ParserCatch } from "./catch"
import { ParserComment } from "./comment"
import { ParserInlineComment } from "./inline-comment"
import { ParserFor } from "./for"

export class ParserAnyBlock {
    /**
     *
     * @param {(p: ParserBase) => *} f
     */
    static generalModes(f) {
        const entry = Object.assign(
            {},
            ParserExpression.expressionParser(f, "lineEnd"),
            {
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
                closeCurly: () => ({ mode: "end" }),
                comment: () => {
                    const php = new ParserComment()
                    f(php)
                    return { consumer: php }
                },
                inlineComment: () => {
                    const php = new ParserInlineComment()
                    f(php)
                    return { consumer: php }
                },
                space: () => { },
            }
        )
        return {
            entry: entry,
            initial: {
                openCurly: () => ({mode: "entry"}),
                space: () => { },
            },
            lineEnd: {
                semicolon: () => ({mode: "entry"}),
            },
            postIf: Object.assign(
                {
                    bareword_else: () => {
                        const node = new ParserBlock()
                        f(node)
                        return {consumer: node, mode: "entry"}
                    },
                    bareword_elseif: () => {
                        const node = new ParserIf()
                        f(node)
                        return {consumer: node}
                    },
                },
                entry
            ),
            postTry: Object.assign(
                {
                    bareword_catch: () => {
                        const node = new ParserCatch()
                        f(node)
                        return {consumer: node, mode: "entry"}
                    },
                    bareword_finally: () => {
                        const node = new ParserBlock()
                        f(node)
                        return {consumer: node}
                    },
                },
                entry
            ),
        }
    }
}