export class ParserString {
    /**
     * This returns what PHP would see as the value of a character when escaped
     *
     * @param {string} c eg. "n"
     */
    static escapeCharacter(c) {
        switch(c) {
            case "0": return "\0"
            case "n": return "\n"
            case "r": return "\r"
            case "\\":
                // Fall through
            case "\"":
                return c
            default:
                if(c.match(/[A-Z]/)) {
                    return `\\${c}`
                } else {
                    console.log(`Unknown escape \\${c}`)
                    return c
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
