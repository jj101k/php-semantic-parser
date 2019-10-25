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
                    [/^[a-zA-Z]\w*/, "bareword"],
                    [/^[(]/, "open-bracket"],
                    [/^[)]/, "close-bracket"],
                    [/^[[]/, "open-square"],
                    [/^[\]]/, "close-square"],
                    [/^[{]/, "open-curly"],
                    [/^[}]/, "close-curly"],
                    [/^\d+([.]\w+)?/, "number"],
                    [/^[.]/, "dot"],
                    [/^->/, "arrow"],
                    [/^=>/, "fat-arrow"],
                    [/^,/, "comma"],
                    [/^[$][a-zA-Z]\w*/, "varname"],
                    [/^"/, "quote-double", "stringDouble"],
                    [/^'/, "quote-single", "stringSingle"],
                    [/^[*\/+-]/, "maths-operator"],
                    [/^[&|^]/, "bit-operator"],
                    [/^(?:&&|[|][|])/, "boolean-operator"],
                    [/^;/, "semicolon"],
                    [/^[?]>/, "end-of-php", "-pop"],
                ],
                comment: [
                    [/^\\/, "escape", "escape"],
                    [/^[^\\]*?[*]\//, "comment", "-pop"],
                ],
                escape: [
                    [/^./, "escaped-char", "-pop"],
                ],
                stringDouble: [
                    [/^\\/, "escape", "escape"],
                    [/^"/, "quote-double", "-pop"],
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
                    throw new Error(`Loop in ${mode} at ${last_contents.substring(0, 15)}...`)
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