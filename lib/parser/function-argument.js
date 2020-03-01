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
            return new ParserStateChange(null, "postValue")
        }
        const ellipsis = () => {this.isRest = true; return new ParserStateChange(null, "nameOnly")}
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
                equals: () => new ParserStateChange(null, "defaultValue"),
                ...this.commentOrSpace,
            },
        }
    }
}
