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
                questionMark: () => {
                    this.type = new ParserType()
                    return {consumer: this.type, mode: "name", reconsumeLast: 1}
                },
                varname,
            },
            name: {
                ampersand,
                space: () => {},
                varname,
            },
            postValue: {
                closeBracket: () => ({mode: "end", reconsumeLast: 1}),
                comma: () => ({mode: "end", reconsumeLast: 1}),
                equals: () => ({mode: "defaultValue"}),
                space: () => {},
            },
        }
    }
}
