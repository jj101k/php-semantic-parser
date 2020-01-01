export class ParserAliasedVariable {
    /**
     *
     * @param {ParserVariable} variable
     */
    constructor(variable) {
        this.variable = variable
    }
}

export class ParserVariable {
    /**
     *
     * @param {string} name
     * @param {boolean} is_static
     */
    constructor(name, is_static = false) {
        this.isStatic = is_static
        this.name = name
    }
}

export class ParserVariablePBR {
    /**
     *
     * @param {string} name
     */
    constructor(name) {
        this.name = name
    }
}