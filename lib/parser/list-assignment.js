import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler } from "../parser-state-handler"

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
            entry: new ParserStateHandler({
                closeBracket: () => this.end,
                comma: () => {
                    this.nodes.push(null)
                    return ParserStateChange.mode("entry")
                },
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
                ...this.commentOrSpace,
            }),
            first: new ParserStateHandler({
                comma: () => {
                    this.nodes.push(null)
                    return ParserStateChange.mode("entry")
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
            }),
            initial: new ParserStateHandler({
                openBracket: () => ParserStateChange.mode("first"),
                space: () => {},
            }),
            postEntry: new ParserStateHandler({
                closeBracket: () => this.end,
                comma: () => ParserStateChange.mode("entry"),
            }),
        }
    }
}
export class ParserListImplied extends ParserList {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            entry: new ParserStateHandler({
                closeSquare: () => this.end,
                comma: () => {
                    this.nodes.push(null)
                    return ParserStateChange.mode("entry")
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
            }),
            first: new ParserStateHandler({
                comma: () => {
                    this.nodes.push(null)
                    return ParserStateChange.mode("entry")
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
            }),
            initial: new ParserStateHandler({
                openSquare: () => ParserStateChange.mode("first"),
                space: () => {},
            }),
            postEntry: new ParserStateHandler({
                closeSquare: () => this.end,
                comma: () => ParserStateChange.mode("entry"),
            }),
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
            assignment: new ParserStateHandler({
                equals: () => {
                    const node = new ParserExpression()
                    this.right = node
                    return new ParserStateChange(node, "end")
                },
                space: () => {},
            }),
            initial: new ParserStateHandler({
                openBracket: () => {
                    const l = new ParserList()
                    this.left = l
                    return new ParserStateChange(l, "assignment", 1)
                },
                space: () => {},
            }),
        }
    }
}
export class ParserListAssignmentImplied extends ParserListAssignment {
    /**
     * @type {ParserBase["modes"]}
     */
    get modes() {
        return {
            assignment: new ParserStateHandler({
                equals: () => {
                    const node = new ParserExpression()
                    this.right = node
                    return new ParserStateChange(node, "end")
                },
                space: () => {},
            }),
            initial: new ParserStateHandler({
                openSquare: () => {
                    const l = new ParserListImplied()
                    this.left = l
                    return new ParserStateChange(l, "assignment", 1)
                },
                space: () => {},
            }),
        }
    }
}