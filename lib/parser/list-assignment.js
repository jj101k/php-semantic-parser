import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"

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
                closeBracket: () => this.end,
                comma: () => {
                    this.nodes.push(null)
                    return new ParserStateChange(null, "entry")
                },
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
                ...this.commentOrSpace,
            },
            first: {
                comma: () => {
                    this.nodes.push(null)
                    return new ParserStateChange(null, "entry")
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
            },
            initial: {
                openBracket: () => new ParserStateChange(null, "first"),
                space: () => {},
            },
            postEntry: {
                closeBracket: () => this.end,
                comma: () => new ParserStateChange(null, "entry"),
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
                closeSquare: () => this.end,
                comma: () => {
                    this.nodes.push(null)
                    return new ParserStateChange(null, "entry")
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
            },
            first: {
                comma: () => {
                    this.nodes.push(null)
                    return new ParserStateChange(null, "entry")
                },
                space: () => {},
                varname: () => {
                    const node = new ParserExpression()
                    this.nodes.push(node)
                    return new ParserStateChange(node, "postEntry", 1)
                },
            },
            initial: {
                openSquare: () => new ParserStateChange(null, "first"),
                space: () => {},
            },
            postEntry: {
                closeSquare: () => this.end,
                comma: () => new ParserStateChange(null, "entry"),
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
                    return new ParserStateChange(node, "end")
                },
                space: () => {},
            },
            initial: {
                openBracket: () => {
                    const l = new ParserList()
                    this.left = l
                    return new ParserStateChange(l, "assignment", 1)
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
                    return new ParserStateChange(node, "end")
                },
                space: () => {},
            },
            initial: {
                openSquare: () => {
                    const l = new ParserListImplied()
                    this.left = l
                    return new ParserStateChange(l, "assignment", 1)
                },
                space: () => {},
            },
        }
    }
}