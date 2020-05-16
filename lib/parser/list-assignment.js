import { ParserBase } from "./base"
import { ParserExpression } from "./expression"
import { ParserStateChange } from "../parser-state-change"
import { ParserStateHandler, ParserStateHandlerEnd } from "../parser-state-handler"

export class ParserList extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const entry = new ParserStateHandler({
            closeBracket: () => this.end,
            comma: () => {
                this.nodes.push(null)
                return ParserStateChange.mode(entry)
            },
            varname: () => {
                const node = new ParserExpression()
                this.nodes.push(node)
                return new ParserStateChange(node, postEntry, 1)
            },
            ...this.commentOrSpace,
        })
        const first = new ParserStateHandler({
            comma: () => {
                this.nodes.push(null)
                return ParserStateChange.mode(entry)
            },
            space: () => {},
            varname: () => {
                const node = new ParserExpression()
                this.nodes.push(node)
                return new ParserStateChange(node, postEntry, 1)
            },
        })
        const postEntry = new ParserStateHandler({
            closeBracket: () => this.end,
            comma: () => ParserStateChange.mode(entry),
        })
        return new ParserStateHandler({
            openBracket: () => ParserStateChange.mode(first),
            space: () => {},
        })
    }
}
export class ParserListImplied extends ParserList {
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const entry = new ParserStateHandler({
            closeSquare: () => this.end,
            comma: () => {
                this.nodes.push(null)
                return ParserStateChange.mode(entry)
            },
            space: () => {},
            varname: () => {
                const node = new ParserExpression()
                this.nodes.push(node)
                return new ParserStateChange(node, postEntry, 1)
            },
        })
        const first = new ParserStateHandler({
            comma: () => {
                this.nodes.push(null)
                return ParserStateChange.mode(entry)
            },
            space: () => {},
            varname: () => {
                const node = new ParserExpression()
                this.nodes.push(node)
                return new ParserStateChange(node, postEntry, 1)
            },
        })
        const postEntry = new ParserStateHandler({
            closeSquare: () => this.end,
            comma: () => ParserStateChange.mode(entry),
        })
        return new ParserStateHandler({
            openSquare: () => ParserStateChange.mode(first),
            space: () => {},
        })
    }
}

export class ParserListAssignment extends ParserBase {
    constructor() {
        super()
        this.nodes = []
    }
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const assignment = new ParserStateHandler({
            equals: () => {
                const node = new ParserExpression()
                this.right = node
                return new ParserStateChange(node, new ParserStateHandlerEnd())
            },
            space: () => {},
        })
        return new ParserStateHandler({
            openBracket: () => {
                const l = new ParserList()
                this.left = l
                return new ParserStateChange(l, assignment, 1)
            },
            space: () => {},
        })
    }
}
export class ParserListAssignmentImplied extends ParserListAssignment {
    /**
     * @type {ParserBase["initialMode"]}
     */
    get initialMode() {
        const assignment = new ParserStateHandler({
            equals: () => {
                const node = new ParserExpression()
                this.right = node
                return new ParserStateChange(node, new ParserStateHandlerEnd())
            },
            space: () => {},
        })
        return new ParserStateHandler({
            openSquare: () => {
                const l = new ParserListImplied()
                this.left = l
                return new ParserStateChange(l, assignment, 1)
            },
            space: () => {},
        })
    }
}