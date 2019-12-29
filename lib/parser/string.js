export class ParserString {
    /**
     * This returns what PHP would see as the value of a character when escaped
     *
     * @param {string} c eg. "n"
     */
    static escapeCharacter(c) {
        switch(c[1]) {
            case "0": return "\0"
            case "n": return "\n"
            case "r": return "\r"
            case "t": return "\t"
            case "\\":
                // Fall through
            case "\"":
                return c[1]
            default:
                if(c.match(/[A-Z]/)) {
                    return c
                } else {
                    console.log(`Unknown escape ${c}`)
                    return c[1]
                }
        }
    }
    /**
     *
     * @param {string} contents
     */
    constructor(contents) {
        this.contents = contents
    }
}
