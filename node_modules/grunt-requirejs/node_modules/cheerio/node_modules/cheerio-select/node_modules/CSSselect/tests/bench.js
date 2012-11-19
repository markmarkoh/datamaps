var CSSselect = require("../"),
	ben = require("ben"),
	testString = "doo, *#foo > elem.bar[class$=bAz i]:not([ id *= \"2\" ])",
	helper = require("./helper.js"),
	parse = require("../"),
	dom = helper.getDefaultDom();

console.log("Parsing took:", ben(1e5, function(){CSSselect(testString);}));
testString = parse(testString);
console.log("Executing took:", ben(1e6, function(){CSSselect.iterate(testString, dom);})*1e3);