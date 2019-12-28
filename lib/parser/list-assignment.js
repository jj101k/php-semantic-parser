import { ParserBase } from "./base"
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
                    return {consumer: node, mode: "postEntry", reconsumeLast: 1}
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
                    return {consumer: node, mode: "postEntry", reconsumeLast: 1}
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
