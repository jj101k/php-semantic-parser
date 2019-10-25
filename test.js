const assert = require("assert")
const fs = require("fs")
const PHPSemanticParser = require("./index")

const trivial_test = fs.readFileSync(__dirname + "/test-php/trivial.php", {encoding: "utf8"})
const p = new PHPSemanticParser(trivial_test)
assert.ok(p.parse().nodes[0].nodes[0], "Trivial parse works")