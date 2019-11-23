import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
export class ParserFunctionArgument extends ParserBase {
    get modes() {
        return {
            defaultValue: ParserStaticExpression.expressionParser(
                php => this.defaultValue = php,
                "end"
            ),
            initial: {
                bareword: c => {
                    this.type = c
                    return { mode: "name" }
                },
                varname: c => {
                    this.name = c
                    return { mode: "postValue" }
                },
            },
            name: {
                space: () => { },
                varname: c => {
                    this.name = c
                    return { mode: "postValue" }
                },
            },
            postValue: {
                closeBracket: () => ({mode: "end", reconsume: true}),
                comma: () => ({mode: "end", reconsume: true}),
                equals: () => ({mode: "defaultValue"}),
                space: () => { },
            },
        }
    }
}
