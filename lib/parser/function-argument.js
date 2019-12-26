import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
export class ParserFunctionArgument extends ParserBase {
    constructor() {
        super()
        this.byRef = false
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
                bareword: c => {
                    this.type = c
                    return {mode: "name"}
                },
                varname,
            },
            name: {
                ampersand,
                space: () => {},
                varname,
            },
            postValue: {
                closeBracket: () => ({mode: "end", reconsume: true}),
                comma: () => ({mode: "end", reconsume: true}),
                equals: () => ({mode: "defaultValue"}),
                space: () => {},
            },
        }
    }
}
