export class NamespaceVariable {
    constructor() {
        /**
         * @private
         * @type {Map<string, ?string>}
         */
        this.contents = new Map()
    }
    /**
     *
     * @param {string} name
     * @param {?string} value
     */
    set(name, value) {
        const old = this.contents.get(name)
        if(old === undefined) {
            this.contents.set(name, value)
        } else {
            // If they are not the same, downgrade to mixed (null)
            if(old && old != value) {
                this.contents.set(name, null)
            }
        }
        this.contents.set(name, value)
    }
}