var ben = require("ben"),
	decode = require("./").decodeXML,
	encode = require("./").encode,
	decoded = "asdf & ÿ ü '",
	encoded = encode(decoded);

(function(result){
	if(result !== "asdf &amp; &#255; &#252; &apos;"){
		throw Error("Unexpected output: " + result);
	}
}(encode(decoded)));

var tmp = Array(201).join(decoded);
console.log("Encoding:", ben(function(){ encode(tmp); }));

(function(result){
	if(result !== decoded){
		throw Error("Unexpected output: " + result);
	}
}(decode(encoded, 2)));

tmp = Array(201).join(encoded);
console.log("Decoding:", ben(function(){ decode(tmp, 2); }));