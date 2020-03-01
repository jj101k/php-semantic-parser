import { ParserBase } from "./base"
import { ParserStaticExpression } from "./expression"
import { ParserType } from "./type"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

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
            initial: new ParserStateHandler({
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
            }),
            name: new ParserStateHandler({
                ampersand,
                ellipsis,
                space: () => {},
                varname,
            }),
            nameOnly: new ParserStateHandler({
                space: () => {},
                varname,
            }),
            postValue: new ParserStateHandler({
                closeBracket: () =>  this.nope,
                comma: () => this.nope,
                equals: () => ParserStateChange.mode("defaultValue"),
                ...this.commentOrSpace,
            }),
        }
    }
}
