import { ParserBase } from "./base"
import { ParserExpression } from "./expression"

export class ParserList extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            entry: {
                closeBracket: () => ({mode: "end"}),
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
                space: () => {},
            },
            postEntry: {
                closeBracket: () => ({mode: "end"}),
                comma: () => ({mode: "entry"}),
            },
        }
    }
}
export class ParserListImplied extends ParserList {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            entry: {
                closeSquare: () => ({mode: "end"}),
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
                openSquare: () => ({mode: "first"}),
                space: () => {},
            },
            postEntry: {
                closeSquare: () => ({mode: "end"}),
                comma: () => ({mode: "entry"}),
            },
        }
    }
}

export class ParserListAssignment extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["modes"]}
     */
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
            initial: {
                openBracket: () => {
                    const l = new ParserList()
                    this.left = l
                    return {consumer: l, mode: "assignment", reconsumeLast: 1}
                },
                space: () => {},
            },
        }
    }
}
export class ParserListAssignmentImplied extends ParserListAssignment {
    /**
     * @type {ParserBase["modes"]}
     */
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
            initial: {
                openSquare: () => {
                    const l = new ParserListImplied()
                    this.left = l
                    return {consumer: l, mode: "assignment", reconsumeLast: 1}
                },
                space: () => {},
            },
        }
    }
}