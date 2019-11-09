import { ParserBase } from "./base"
export class ParserPropertyReference extends ParserBase {
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
                    this.propertyName = c
                    return {mode: "end"}
                },
                varname: c => {
                    this.propertyNameRef = c
                    return {mode: "end"}
                }
            },
        }
    }
}
