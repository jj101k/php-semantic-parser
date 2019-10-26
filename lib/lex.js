export class Token {
    /**
     *
     * @param {string} type
     * @param {string} content
     */
    constructor(type, content) {
        this.type = type
        this.content = content
    }
}
export class Lex {
    /**
     *
     * @param {string} contents
     */
    constructor(contents) {
        this.contents = contents
    }
    get tokens() {
        if(!this._tokens) {
            let contents = this.contents
            const possible = {
                html: [
                    [/^.*?<[?]php\b/s, "php", "none"],
                ],
                none: [
                    [/^\s+/, "space"],
                    [/^\/[*][*]/, "comment", "comment"],
                    [/^\\?[_a-zA-Z][\w\\]*/, "bareword"],
                    [/^[(]/, "openBracket"],
                    [/^[)]/, "closeBracket"],
                    [/^[[]/, "openSquare"],
                    [/^[\]]/, "closeSquare"],
                    [/^[{]/, "openCurly"],
                    [/^[}]/, "closeCurly"],
                    [/^\d+([.]\w+)?/, "number"],
                    [/^[.]/, "dot"],
                    [/^->/, "arrow"],
                    [/^=>/, "fatArrow"],
                    [/^,/, "comma"],
                    [/^[$][a-zA-Z]\w*/, "varname"],
                    [/^"/, "quoteDouble", "stringDouble"],
                    [/^'/, "quoteSingle", "stringSingle"],
                    [/^[*\/+-]/, "mathsOperator"],
                    [/^[&|^]/, "bitOperator"],
                    [/^(?:&&|[|][|])/, "booleanOperator"],
                    [/^;/, "semicolon"],
                    [/^:/, "colon"],
                    [/^===/, "equals3"],
                    [/^==/, "equals2"],
                    [/^=/, "equals"],
                    [/^[?]>/, "endOfPhp", "-pop"],
                ],
                comment: [
                    [/^\\/, "escape", "escape"],
                    [/^[^\\*]+/, "string"],
                    [/^[*]\//, "commentEnd", "-pop"],
                    [/^[*]/, "string"], // Last for a reason
                ],
                escape: [
                    [/^./, "escapedChar", "-pop"],
                ],
                stringDouble: [
                    [/^\\/, "escape", "escape"],
                    [/^"/, "quoteDouble", "-pop"],
                    [/^[^"\\]*/, "string"],
                ],
                stringSingle: [
                    [/^.*?'/, "string", "-pop"],
                ],
            }
            let mode = "html"
            const modes = []
            /**
             * @type {Token[]}
             */
            const chunks = []
            let last_contents = contents
            while(contents) {
                let md
                for(const [r, n, new_mode] of possible[mode]) {
                    if(md = contents.match(r)) {
                        contents = contents.substring(md[0].length)
                        chunks.push(new Token(n, md[0]))
                        if(new_mode) {
                            if(new_mode == "-pop") {
                                mode = modes.pop()
                            } else {
                                modes.push(mode)
                                mode = new_mode
                            }
                        }
                        break
                    }
                }
                if(last_contents == contents) {
                    throw new Error(`Lexer loop in mode ${mode} at ${JSON.stringify(last_contents.substring(0, 15) + "...")}`)
                }
                if(contents == "") {
                    break
                }
                last_contents = contents
            }
            this._tokens = chunks
        }
        return this._tokens
    }
}