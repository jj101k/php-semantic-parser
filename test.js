const fs = require("fs")
const PHPSemanticParser = require("./index")

const simple_test = fs.readFileSync(__dirname + "/test-php/trivial.php", {encoding: "utf8"})
const p = new PHPSemanticParser(simple_test)
console.log(p.parse())