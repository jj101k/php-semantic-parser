import { ParserBase } from "./base"
import { ParserVariable } from "./variable"
import { ParserExpression } from "./expression"
export class ParserListAssignment extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    get modes() {
        return {
            assignment: {
                equals: () => {
                    const node = new ParserExpression()
                    this.right = node
                    return {consumer: node, mode: "end"}
                },
                space: () => {},
            },
            entry: {
                closeBracket: () => ({mode: "assignment"}),
                comma: () => {
                    this.nodes.push(null)
                    return {mode: "entry"}
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return {consumer: node, mode: "postEntry", reconsume: true}
                },
            },
            first: {
                comma: () => {
                    this.nodes.push(null)
                    return {mode: "entry"}
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return {consumer: node, mode: "postEntry", reconsume: true}
                },
            },
            initial: {
                openBracket: () => ({mode: "first"}),
            },
            postEntry: {
                closeBracket: () => ({mode: "assignment"}),
                comma: () => ({mode: "entry"}),
            },
        }
    }
}
