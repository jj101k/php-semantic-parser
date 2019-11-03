import { ParserBase } from "./base"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"
import { ParserForeach } from "./foreach"
import { ParserSwitch } from "./switch"
import { ParserThrow } from "./throw"

export class ParserAnyBlock {
    /**
     *
     * @param {(p: ParserBase) => *} f
     * @param {string} next_mode
     */
    static blockStatementParser(f, next_mode) {
        return {
            bareword_echo: () => {
                const php = new ParserEcho()
                f(php)
                return {consumer: php, mode: next_mode}
            },
            bareword_foreach: () => {
                const php = new ParserForeach()
                f(php)
                return {consumer: php, mode: next_mode}
            },
            bareword_function: () => {
                const php = new ParserFunction()
                f(php)
                return {consumer: php, mode: next_mode}
            },
            bareword_switch: () => {
                const php = new ParserSwitch()
                f(php)
                return {consumer: php, mode: next_mode}
            },
            bareword_throw: () => {
                const php = new ParserThrow()
                f(php)
                return {consumer: php, mode: next_mode}
            },
        }
    }
}