import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserAbstractFunction, ParserFunction } from "./function"
import { ParserVariable } from "./variable"
import { ParserUseTrait } from "./use-trait"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

class ParserClassConstant extends ParserBase {
    constructor() {
        super()
        this.name = null
        this.value = null
    }
    get initialMode() {
        const initialValue = ParserStaticExpression.expressionParser(
            php => this.value = php,
            new ParserStateHandlerEnd()
        )
        const postConstant = new ParserStateHandler({
            comma: () => this.nope,
            equals: () => ParserStateChange.mode(initialValue),
            semicolon: () => this.nope,
            space: () => {},
        })
        return new ParserStateHandler({
            bareword: c => {
                this.name = c
                return ParserStateChange.mode(postConstant)
            },
            space: () => {},
        })
    }
}

class ParserClassConstantList extends ParserBase {
    /**
     * @param {"private" | "protected" | "public" | null} visibility
     */
    constructor(visibility = null) {
        super()
        /**
         * @type {ParserClassConstant[]}
         */
        this.values = []
        this.visibility = visibility
    }
    get initialMode() {
        const nextConstant = new ParserStateHandler({
            bareword: () => {
                const pcc = new ParserClassConstant()
                this.values.push(pcc)
                return new ParserStateChange(pcc, postConstant, 1)
            },
            space: () => {},
        })
        const postConstant = new ParserStateHandler({
            comma: () => ParserStateChange.mode(nextConstant),
            semicolon: () => this.nope,
            space: () => {},
        })
        return new ParserStateHandler({
            bareword: () => {
                const pcc = new ParserClassConstant()
                this.values.push(pcc)
                return new ParserStateChange(pcc, postConstant, 1)
            },
            space: () => {},
        })
    }
}

class ParserClassVariable extends ParserBase {
    constructor() {
        super()
        this.name = null
        this.defaultValue = null
    }
    get initialMode() {
        const initialValue = ParserStaticExpression.expressionParser(
            php => this.defaultValue = php,
            new ParserStateHandlerEnd()
        )
        const postVariable = new ParserStateHandler({
            comma: () => this.nope,
            equals: () => ParserStateChange.mode(initialValue),
            semicolon: () => this.nope,
            space: () => {},
        })
        return new ParserStateHandler({
            varname: c => {
                this.name = new ParserVariable(c)
                return ParserStateChange.mode(postVariable)
            },
        })
    }
}

class ParserClassVariableList extends ParserBase {
    /**
     * @param {"private" | "protected" | "public" | null} visibility
     * @param {?boolean} is_static
     */
    constructor(visibility = null, is_static = null) {
        super()
        this.isStatic = is_static
        /**
         * @type {ParserClassVariable[]}
         */
        this.values = []
        this.visibility = visibility
    }
    get initialMode() {
        const nextVariable = new ParserStateHandler({
            space: () => {},
            varname: c => {
                const pcv = new ParserClassVariable()
                this.values.push(pcv)
                return new ParserStateChange(pcv, postVariable, 1)
            },
        })
        const postVariable = new ParserStateHandler({
            comma: () => ParserStateChange.mode(nextVariable),
            semicolon: () => this.nope,
            space: () => {},
        })
        return new ParserStateHandler({
            varname: c => {
                const pcv = new ParserClassVariable()
                this.values.push(pcv)
                return new ParserStateChange(pcv, postVariable, 1)
            },
        })
    }
}

class ParserMethod extends ParserBase {
    /**
     * @param {"private" | "protected" | "public" | null} visibility
     * @param {?boolean} is_static
     */
    constructor(visibility = null, is_static = null) {
        super()
        this.isAbstract = null
        this.isFinal = null
        this.isStatic = is_static
        /**
         * @type {ParserAbstractFunction | ParserFunction | null}
         */
        this.value = null

        this.visibility = visibility
    }
    get initialMode() {
        return new ParserStateHandler({
            bareword_abstract: () => {this.isAbstract = true},
            bareword_final: () => {this.isFinal = true},
            bareword_function: () => {
                const php = this.isAbstract ?
                    new ParserAbstractFunction() :
                    new ParserFunction()
                this.values = [php]
                return new ParserStateChange(php, new ParserStateHandlerEnd())
            },
            bareword_private: () => {this.visibility = "private"},
            bareword_protected: () => {this.visibility = "protected"},
            bareword_public: () => {this.visibility = "public"},
            bareword_static: () => {this.isStatic = true},
            space: () => {},
        })
    }
}

class ParserClassSymbol extends ParserBase {
    constructor() {
        super()
        /**
         * @type {ParserClassVariableList | ParserClassConstantList | ParserMethod | null}
         */
        this.value = null
    }
    get initialMode() {
        let is_static = false
        /**
         * @type {"private" | "protected" | "public" | null}
         */
        let visibility = null
        const handleMethod = () => {
            const php = new ParserMethod(visibility, is_static)
            this.value = php
            return new ParserStateChange(php, new ParserStateHandlerEnd(), 1)
        }
        const postSymbol = new ParserStateHandler({
            semicolon: () => this.end,
            space: () => {},
        })
        const static_possible_handlers = {
            bareword_abstract: handleMethod,
            bareword_final: handleMethod,
            bareword_function: handleMethod,
            bareword_private: () => {visibility = "private"},
            bareword_protected: () => {visibility = "protected"},
            bareword_public: () => {visibility = "public"},
            bareword_var: () => {
                // PHP4
                this.value = new ParserClassVariableList("public", is_static)
                return new ParserStateChange(this.value, postSymbol)
            },
            space: () => {},
            varname: () => {
                this.value = new ParserClassVariableList(visibility, is_static)
                return new ParserStateChange(this.value, postSymbol, 1)
            },
        }
        const staticPossible = new ParserStateHandler(static_possible_handlers)
        return new ParserStateHandler({
            ...static_possible_handlers,
            bareword_const: () => {
                this.value = new ParserClassConstantList(visibility)
                return new ParserStateChange(this.value, postSymbol)
            },
            bareword_static: () => {
                is_static = true
                return ParserStateChange.mode(staticPossible)
            },
        })
    }
}
export class ParserClassBody extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        return new ParserStateHandler({
            ...this.commentOrSpace,
            bareword: c => {
                const php = new ParserClassSymbol()
                this.nodes.push(php)
                return new ParserStateChange(php, null, 1)
            },
            bareword_use: () => {
                const ut = new ParserUseTrait()
                this.nodes.push(ut)
                return new ParserStateChange(ut)
            },
            closeCurly: () => ParserStateChange.end,
        })
    }
}
