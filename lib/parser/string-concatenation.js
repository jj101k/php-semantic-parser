import { ParserBase } from "./base"
import { ParserExpression, ParserStaticExpression } from "./expression"

export class ParserStaticStringConcatenation extends ParserBase {
    /**
     *
     * @param {ParserBase} left
     */
    constructor(left) {
        super()
        this.left = left
    }
    get expressionClass() {
        return ParserStaticExpression
    }
    get modes() {
        return {
            initial: this.expressionClass.expressionParser(
                php => this.right = php,
                "end"
            ),
        }
    }
}

export class ParserStringConcatenation extends ParserStaticStringConcatenation {
    get expressionClass() {
        return ParserExpression
    }
}