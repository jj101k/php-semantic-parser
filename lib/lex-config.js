/**
 * @typedef {{pattern: RegExp, minLength: number, maxLength?: number}} regexpFull
 * @typedef {regexpFull | string | RegExp} singleMatch
 * @typedef {{[symbol: string]: singleMatch | lexConfigDetail | singleMatch[]}} lexConfig
 * @typedef {{match: singleMatch | singleMatch[], abortMatch?: string, endMatch?: string, then: lexConfig | string}} lexConfigDetail
 */

/**
 * @type {lexConfig}
 */
export const LexConfig = {
    $other: /^.+/s,
    php: {
        match: {pattern: /^.*?<[?]php\b/s, minLength: 5},
        endMatch: "?>",
        then: {
            aliasedVarnameStart: "${",
            aliasedVarname: {pattern: /^[$][$][_a-zA-Z]\w*/, minLength: 3},
            ampersand: "&",
            arrow: "->",
            at: "@",
            bareword: /^\\?[_a-zA-Z\u0080-\uffff][\w\\\u0080-\uffff]*/,
            bitOperator: ["|", "^"],
            booleanOperator: ["&&", "||"],
            closeBracket: ")",
            closeCurly: "}",
            closeSquare: "]",
            colon: ":",
            comma: ",",
            comment: {
                match: ["/**", "/*"],
                endMatch: "*/",
                then: {
                    escapedCharacter: {pattern: /^\\./s, minLength: 2, maxLength: 2},
                    string: ["*", /^[^\\*]+/],
                },
            },
            dot: ".",
            doubleColon: "::",
            doubleQuestionMark: "??",
            ellipsis: "...",
            equals2: "==",
            equals3: "===",
            equals: "=",
            fatArrow: "=>",
            greaterEquals: ">=",
            greaterThan: ">",
            heredoc: {
                match: {pattern: /^<<<\s*(\w+)/, minLength: 3},
                endMatch: "\n$1",
                then: {
                    escapedCharacter: {pattern: /^\\./s, minLength: 2, maxLength: 2},
                    string: [/^\n/, /^[^\\\n]+/],
                },
            },
            inlineComment: {
                match: ["//", "#"],
                abortMatch: "?>",
                endMatch: "\n",
                then: {
                    string: [/^[^?\n]+/, "?"],
                },
            },
            inPlaceConcatenation: ".=",
            inPlaceBitOperator: ["|=", "&=", "^="],
            inPlaceMathsOperator: ["*=", "/=", "+=", "-=", "%="],
            lessEquals: "<=",
            lessThan: "<",
            mathsOperator: ["**", "*", "/", "%", "<<", ">>"],
            minusminus: "--",
            not: "!",
            notEquals2: "!=",
            notEquals3: "!==",
            nowdoc: {
                match: {pattern: /^<<<\s*'(\w+)'/, minLength: 5},
                endMatch: "\n$1",
                then: {
                    escapedCharacter: {pattern: /^\\./s, minLength: 2, maxLength: 2},
                    string: [/^\n/, /^[^\\\n]+/],
                },
            },
            number: [
                /^\d+([.]\d+)?([Ee][+-]?\d+)?/,
                {pattern: /^[.]\d+/, minLength: 2},
                {pattern: /^0b[01]+/, minLength: 3},
                {pattern: /^0x[0-9a-f]+/i, minLength: 3},
            ],
            openBracket: "(",
            openCurly: "{",
            openSquare: "[",
            plusplus: "++",
            questionMark: "?",
            quoteBack: {
                match: "`",
                then: {
                    escapedCharacter: {pattern: /^\\./s, minLength: 2, maxLength: 2},
                    interpolation: {
                        match: {pattern: /^[{][$]\w+/, minLength: 3},
                        endMatch: "}",
                        then: "php",
                    },
                    string: ["{", /^[^`\\{]+/],
                },
            },
            quoteDouble: {
                match: "\"",
                then: {
                    escapedCharacter: {pattern: /^\\./s, minLength: 2, maxLength: 2},
                    interpolation: {
                        match: {pattern: /^[{][$]\w+/, minLength: 3},
                        endMatch: "}",
                        then: "php",
                    },
                    string: ["{", /^[^"\\{]+/],
                },
            },
            quoteSingle: {
                match: "'",
                then: {
                    escapedCharacter: {pattern: /^\\./s, minLength: 2, maxLength: 2},
                    string: /^[^'\\]+/,
                },
            },
            semicolon: ";",
            space: /^\s+/,
            spaceship: "<=>",
            unaryMathsOperator: ["+", "-", "~"],
            varname: {pattern: /^[$][_a-zA-Z]\w*/, minLength: 2},
        },
    },
}