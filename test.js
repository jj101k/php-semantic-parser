const assert = require("assert")
const fs = require("fs")
const PHPSemanticParser = require("./index")

const trivial_test = fs.readFileSync(__dirname + "/test-php/trivial.php", {encoding: "utf8"})
const p = new PHPSemanticParser(trivial_test)
assert.ok(p.parse(__dirname + "/test-php/trivial.php").nodes[0].nodes[0], "Trivial parse works")

const simple_test = fs.readFileSync(__dirname + "/test-php/simple.php", {encoding: "utf8"})
const p2 = new PHPSemanticParser(simple_test)
assert.ok(p2.parse(__dirname + "/test-php/simple.php"), "Simple parse works")