import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
export class ParserStringConcatenation extends ParserBase {
    constructor(left) {
        super()
        this.left = left
    }
    get modes() {
        const handle_expression = () => {
            const php = new ParserExpression()
            this.right = php
            return { consumer: php, mode: "end", reconsume: true }
        }
        return {
            initial: {
                space: () => { },
                quoteDouble: handle_expression,
                varname: handle_expression,
            },
        }
    }
}
