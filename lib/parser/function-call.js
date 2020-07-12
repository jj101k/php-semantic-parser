import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserSpread } from "./spread"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"
import { NamespaceConstant } from "../namespace/constant"
import { ParserConstant } from "./constant"

export class ParserFunctionCall extends ParserBase {
    constructor(function_ref) {
        super()
        this.functionRef = function_ref
        this.arguments = []

        /**
         * @type {?NamespaceConstant.defaultFunctions[""]["arguments"]}
         */
        this.argumentInfo = null
        if(function_ref instanceof ParserConstant) {
            const canonical_name = function_ref.name.replace(/^\\+/, "")
            const info = NamespaceConstant.defaultFunctions[canonical_name]
            if(info) {
                this.argumentInfo = info.arguments
            }
        }
    }
    get initialMode() {
        const closeBracket = () => this.end
        const next = new ParserStateHandler({
            closeBracket,
            comma: () => ParserStateChange.mode(later),
        })
        const ellipsis = () => {
            const s = new ParserSpread()
            return new ParserStateChange(s, next)
        }
        const import_expression = php => {
            if(this.argumentInfo && this.argumentInfo.length > this.arguments.length) {
                php.isPassByReference = this.argumentInfo[this.arguments.length].pbr
            }
            this.arguments.push(php)
        }
        const later = new ParserStateHandler({
            ellipsis,
            ...ParserExpression.expressionParser(
                import_expression,
                next
            ).handlers,
        })
        return new ParserStateHandler({
            closeBracket,
            ellipsis,
            ...ParserExpression.expressionParser(
                import_expression,
                next
            ).handlers,
        })
    }
}
