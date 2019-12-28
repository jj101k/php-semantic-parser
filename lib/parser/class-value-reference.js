import { ParserBase } from "./base"

export class ParserClassValueReference extends ParserBase {
    /**
     *
     * @param {ParserBase} object
     */
    constructor(object) {
        super()
        this.object = object
    }
    get modes() {
        return {
            initial: {
                bareword: c => {
                    this.constName = c
                    return {mode: "end"}
                },
                varname: c => {
                    this.varName = c
                    return {mode: "end"}
                }
            },
        }
    }
}
