import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserType } from "./type"
import { ParserStateChange } from "../parser-state-change"

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
            return ParserStateChange.mode("postValue")
        }
        const ellipsis = () => {this.isRest = true; return ParserStateChange.mode("nameOnly")}
        return {
            defaultValue: ParserStaticExpression.expressionParser(
                php => this.defaultValue = php,
                "end"
            ),
            initial: {
                ampersand,
                bareword: () => {
                    this.type = new ParserType()
                    return new ParserStateChange(this.type, "name", 1)
                },
                ellipsis,
                questionMark: () => {
                    this.type = new ParserType()
                    return new ParserStateChange(this.type, "name", 1)
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
                equals: () => ParserStateChange.mode("defaultValue"),
                ...this.commentOrSpace,
            },
        }
    }
}
