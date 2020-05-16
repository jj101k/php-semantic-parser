import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserAbstractFunction } from "./function"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

class ParserInterfaceSymbol extends ParserBase {
    get initialMode() {
        const constName = new ParserStateHandler({
            bareword: c => {
                this.constName = c
                return ParserStateChange.mode(postVariable)
            },
            space: () => {},
        })
        const postValue = new ParserStateHandler({
            semicolon: () => this.end,
            space: () => {},
        })
        const initialValue = ParserStaticExpression.expressionParser(php => this.valueValue = php, postValue)
        const postVariable = new ParserStateHandler({
            equals: () => ParserStateChange.mode(initialValue),
            semicolon: () => this.end,
            space: () => {},
        })
        return new ParserStateHandler({
            bareword_const: () => ParserStateChange.mode(constName),
            bareword_function: () => {
                const php = new ParserAbstractFunction()
                this.value = php
                return new ParserStateChange(php, new ParserStateHandlerEnd())
            },
            bareword_private: () => {this.visibility = "private"},
            bareword_protected: () => {this.visibility = "protected"},
            bareword_public: () => {this.visibility = "public"},
            bareword_static: () => {this.isStatic = true},
            bareword_var: () => {this.visibility = "public"}, // PHP4
            space: () => {},
        })
    }
}
export class ParserInterfaceBody extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get initialMode() {
        return new ParserStateHandler({
            ...this.commentOrSpace,
            bareword: c => {
                const php = new ParserInterfaceSymbol()
                this.nodes.push(php)
                return new ParserStateChange(php, null, 1)
            },
            closeCurly: () => ParserStateChange.end,
        })
    }
}
