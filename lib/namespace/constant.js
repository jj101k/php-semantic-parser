const fs = require("fs")
const zlib = require("zlib")

export class NamespaceConstant {
    static get defaultFunctions() {
        if(this._defaultFunctions) {
            return this._defaultFunctions
        } else {
            /**
             * @private
             * @type {{[name: string]: {arguments: {optional: boolean, pbr: boolean}[]}}}
             */
            const defaults = JSON.parse(
                zlib.gunzipSync(
                    fs.readFileSync(
                        "data/php-functions.json.gz"
                    ),
                ).toString("utf-8"),
            )
            this._defaultFunctions = defaults
            return defaults
        }
    }
}