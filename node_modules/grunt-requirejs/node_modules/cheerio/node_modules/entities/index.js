var re_hex = /&#x[\da-f]+;?/gi,
	re_strictHex = /&#x[\da-f]+;/gi,
	re_charCode = /&#\d+;?/g,
	re_strictCharCode = /&#\d+;/g,
	re_notUTF8 = /[\u0000-\u001f\u007f-\uffff]/g,
	fromCharCode = String.fromCharCode,
	num_func = function(num){return fromCharCode(parseInt(num.substr(2), 10));},
	hex_func = function(hex){return fromCharCode(parseInt(hex.substr(3), 16));},
	strictNum_func = function(num){return fromCharCode(num.slice(2, -1));},
	strictHex_func = function(num){return fromCharCode(parseInt(num.slice(3, -1), 16));},
	charCode_func = function(c){ return "&#" +c.charCodeAt(0) +";";};

var readFile = require("fs").readFileSync;
var fetch = function(filename, inherits){
	var obj = JSON.parse(readFile(__dirname +"/entities/" +filename +".json", "utf8"));
	
	if(inherits) for(var name in inherits) obj[name] = inherits[name];
	
	var re = Object.keys(obj).sort().join("|").replace(/(\w+)\|\1;/g, "$1;?");

	return {
		func: function(name){
			return obj[name.substr(1)];
		},
		re: new RegExp("&(?:" +re +")", "g"),
		obj: obj
	};
};

var getReverse = function(obj){
	var reverse = Object.keys(obj).reduce(function(reverse, name){
		reverse[obj[name]] = name;
		return reverse;
	}, {});
	
	return {
		func: function(name){ return "&" +reverse[name]; },
		re: new RegExp("\\" +Object.keys(reverse).sort().join("|\\"), "g")
	}	
};

var modes = ["XML", "HTML4", "HTML5"];

module.exports = {
	decode: function(data, level){
		if(!modes[level]) level = 0;
		return module.exports["decode" +modes[level]](data);
	},
	encode: function(data, level){
		if(!modes[level]) level = 0;
		return module.exports["encode" +modes[level]](data);
	}
};

var tmp;

modes.forEach(function(name){
	var obj = fetch(name.toLowerCase(), tmp),
		regex = obj.re,
		func = obj.func;
	
	tmp = obj.obj;
	
	if(!module.exports["decode" +name]){
		module.exports["decode" +name] = function(data){
			return data
				.replace(regex, func)
				.replace(re_hex, hex_func)
				.replace(re_charCode, num_func);
		};
	}
	
	var reverse = getReverse(obj.obj),
		reverse_re = reverse.re,
		reverse_func = reverse.func;
	
	module.exports["encode" +name] = function(data){
		return data
			.replace(reverse_re, reverse_func)
			.replace(re_notUTF8, charCode_func);
	};
});