export class NamespaceVariable {
    static get superglobals() {
        return {
            $GLOBALS: null,
            $_SERVER: null,
            $_GET: null,
            $_POST: null,
            $_FILES: null,
            $_COOKIE: null,
            $_SESSION: null,
            $_REQUEST: null,
            $_ENV: null,
        }
    }
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
     */
    has(name) {
        return this.contents.has(name) || name in NamespaceVariable.superglobals
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