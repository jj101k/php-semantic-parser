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
    constructor() {
        super()
        /**
         * @type {ParserClassConstant[]}
         */
        this.values = []
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
    constructor() {
        super()
        /**
         * @type {ParserClassVariable[]}
         */
        this.values = []
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

        this.isStatic = false;
        /**
         * @type {ParserClassVariableList | ParserClassConstantList | ParserMethod | null}
         */
        this.value = null

        /**
         * @type {"private" | "protected" | "public" | null}
         */
        this.visibility = null
    }
    get initialMode() {
        const constName = new ParserStateHandler({
            bareword: () => {
                this.value = new ParserClassConstantList()
                return new ParserStateChange(this.value, postSymbol, 1)
            },
            space: () => {},
        })
        const handleMethod = () => {
            const php = new ParserMethod(this.visibility, this.isStatic)
            this.value = php
            return new ParserStateChange(php, new ParserStateHandlerEnd(), 1)
        }
        const postSymbol = new ParserStateHandler({
            semicolon: () => this.end,
            space: () => {},
        })
        return new ParserStateHandler({
            bareword_abstract: handleMethod,
            bareword_final: handleMethod,
            bareword_function: handleMethod,
            bareword_const: () => ParserStateChange.mode(constName),
            bareword_private: () => {this.visibility = "private"},
            bareword_protected: () => {this.visibility = "protected"},
            bareword_public: () => {this.visibility = "public"},
            bareword_static: () => {this.isStatic = true},
            bareword_var: () => {this.visibility = "public"}, // PHP4
            space: () => {},
            varname: () => {
                this.value = new ParserClassVariableList()
                return new ParserStateChange(this.value, postSymbol, 1)
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
