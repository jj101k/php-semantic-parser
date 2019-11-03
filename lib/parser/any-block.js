import { ParserBase } from "./base"
import { ParserEcho } from "./echo"
import { ParserFunction } from "./function"
import { ParserForeach } from "./foreach"
import { ParserSwitch } from "./switch"
import { ParserThrow } from "./throw"
import { ParserReturn } from "./return"

export class ParserAnyBlock {
    /**
     *
     * @param {(p: ParserBase) => *} f
     */
    static blockStatementParser(f) {
        return {
            bareword_echo: () => {
                const php = new ParserEcho()
                f(php)
                return {consumer: php}
            },
            bareword_foreach: () => {
                const php = new ParserForeach()
                f(php)
                return {consumer: php}
            },
            bareword_function: () => {
                const php = new ParserFunction()
                f(php)
                return {consumer: php}
            },
            bareword_return: () => {
                const php = new ParserReturn()
                f(php)
                return {consumer: php}
            },
            bareword_switch: () => {
                const php = new ParserSwitch()
                f(php)
                return {consumer: php}
            },
            bareword_throw: () => {
                const php = new ParserThrow()
                f(php)
                return {consumer: php}
            },
        }
    }
}