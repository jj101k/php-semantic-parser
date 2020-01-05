import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserType } from "./type"

export class ParserFunctionArgument extends ParserBase {
    constructor() {
        super()
        this.byRef = false
        this.isRest = false
    }
    get modes() {
        const ampersand = () => {this.byRef = true}
        const varname = c => {
            this.name = c
            return {mode: "postValue"}
        }
        const ellipsis = () => {this.isRest = true; return {mode: "nameOnly"}}
        return {
            defaultValue: ParserStaticExpression.expressionParser(
                php => this.defaultValue = php,
                "end"
            ),
            initial: {
                ampersand,
                bareword: () => {
                    this.type = new ParserType()
                    return {consumer: this.type, mode: "name", reconsumeLast: 1}
                },
                ellipsis,
                questionMark: () => {
                    this.type = new ParserType()
                    return {consumer: this.type, mode: "name", reconsumeLast: 1}
                },
                space: () => {},
                varname,
            },
            name: {
                ampersand,
                ellipsis,
                space: () => {},
                varname,
            },
            nameOnly: {
                space: () => {},
                varname,
            },
            postValue: {
                closeBracket: () =>  this.nope,
                comma: () => this.nope,
                equals: () => ({mode: "defaultValue"}),
                space: () => {},
            },
        }
    }
}
