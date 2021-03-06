const fs = require("fs")
const htmlparser = require("node-html-parser")
const data = fs.readFileSync("data-in/php-bigxhtml.html", "utf8")
const zlib = require("zlib")

/**
 * @typedef {{byReference: boolean, defaultValue: ?string, name: string, optionalDepth: number, type: ?string}} arg_out
 * @typedef {{args: arg_out[], static: boolean, returnTypes: string[]}} FunctionTypeInfo
 * @typedef {{text: string}} htmlparserNode
 * @typedef {htmlparserNode & {childNodes: (htmlparserText | htmlparserElement)[], classNames: string[], querySelector(pattern: string): htmlparserElement | null, querySelectorAll(pattern: string): htmlparserElement[]}} htmlparserElement
 * @typedef {htmlparserNode & {}} htmlparserText
 * @typedef {htmlparserElement & {}} htmlparserDocument
 */

/**
 * @type {htmlparserDocument}
 */
const dom = htmlparser.parse(data)


/**
 *
 * @param {htmlparserElement} method_structure
 */
function parse_method_structure(method_structure) {
	/**
	 * @type {FunctionTypeInfo["args"]}
	 */
	const args_out = []
	let optional_depth = 0
	for(const mc of method_structure.childNodes) {
		if("classNames" in mc && mc.classNames.includes("methodparam")) {
			const initialiser = mc.querySelector(".initializer")
			const type = mc.querySelector(".type")
			const name = mc.querySelector(".parameter")
			const initialiser_value_expr = initialiser ? initialiser.text.replace(/^\s+=[\s\r\n]+/, "") : undefined
			let initialiser_value
			switch(initialiser_value_expr) {
				case "FALSE":
					initialiser_value = false
					break
				case "NULL":
					initialiser_value = null
					break
				case "TRUE":
					initialiser_value = true
					break
				case undefined:
					// noop
					break
				default:
					/**
					 * @type {?RegExpMatchArray}
					 */
					let md
					if(md = initialiser_value_expr.match(/^'(.*)'$/)) {
						initialiser_value = md[1]
					} else if(md = initialiser_value_expr.match(/^0(\d*)$/)) {
						initialiser_value = parseInt(md[1], 8)
					} else if(md = initialiser_value_expr.match(/^[.](\d*)$/)) {
						initialiser_value = parseFloat("0" + md[1])
					} else if(md = initialiser_value_expr.match(/^(\d*)[.]$/)) {
						initialiser_value = parseFloat(md[1])
					} else if(initialiser_value_expr.match(/^[A-Z]/i)) {
						console.log(`Cannot parse default value ${initialiser_value_expr}`)
					} else {
						try {
							initialiser_value = JSON.parse(initialiser_value_expr)
						} catch(e) {
							console.log(`Misparse of default value "${initialiser_value_expr}", presuming string`)
							initialiser_value = initialiser_value_expr
						}
					}
			}
			if(name) {
				args_out.push({
					byReference: name.classNames.includes("reference"),
					defaultValue: initialiser_value,
					name: name.text.replace(/^[&]/, ""),
					optionalDepth: optional_depth,
					type: type ? type.text : null,
				})
			}
		} else if(!("classNames" in mc)) {
			optional_depth += mc.text.replace(/[^\[]/g, "").length
			optional_depth -= mc.text.replace(/[^\]]/g, "").length
		}
	}
	const modifiers = method_structure.querySelectorAll(".modifier")
	const type = method_structure.querySelector(".type")
	return {
		args: args_out,
		static: modifiers && modifiers.some(m => m.text == "static"),
		type: type ? type.text : null,
		name: method_structure.querySelector(".methodname").text,
	}
}
/**
 *
 * @param {htmlparserElement} return_info
 * @param {string} name
 */
function parse_return_info(return_info, name) {
	/**
	 * @type {?boolean}
	 */
	let or_false = null
	/**
	 * @type {?boolean}
	 */
	let or_null = null
	const info = return_info.querySelector("p.para") || return_info.querySelector("p.simpara")
	if(info) {
		const text_content = info.text
		if(text_content.match(/\bor NULL\b/i)) {
			or_null = true
		}
		if(text_content.match(/\bor false\b/i)) {
			or_false = true
		}
	} else {
		const t = return_info.querySelector(".doctable")
		if(t) {
			for(const td of t.querySelectorAll("td:first-child")) {
				if(td.text == "FALSE") {
					or_false = true
				} else if(td.text == "NULL") {
					or_null = true
				}
			}
		} else {
			console.log(return_info)
			throw new Error("Cannot parse")
		}
	}
	return {
		orFalse: or_false,
		orNull: or_null,
	}
}
/**
 * @type {{[name: string]: FunctionTypeInfo}}
 */
const function_types = {}
for(const part of dom.querySelectorAll(".refentry")) {
	const synopsis = part.querySelector(".methodsynopsis")
	if(synopsis) {
		const structure = parse_method_structure(synopsis)
		const return_info_in = part.querySelector(".returnvalues")
		if(return_info_in) {
			const return_info = parse_return_info(return_info_in, structure.name)
			const types = structure.type ? [structure.type] : []
			if(return_info.orFalse) {
				types.push("false")
			}
			if(return_info.orNull) {
				types.push("null")
			}
			function_types[structure.name] = {
				args: structure.args,
				returnTypes: types,
				static: !!structure.static,
			}
		} else {
			function_types[structure.name] = {
				args: structure.args,
				returnTypes: structure.type ? [structure.type] : [],
				static: !!structure.static,
			}
		}
	}
}
fs.writeFileSync(
	"data/php-function-types.json.gz",
	zlib.gzipSync(JSON.stringify(function_types))
)
