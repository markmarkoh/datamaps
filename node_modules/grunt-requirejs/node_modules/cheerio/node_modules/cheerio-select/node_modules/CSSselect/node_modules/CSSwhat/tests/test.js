var deepEquals = require("assert").deepEqual,
    CSSwhat = require("../");

var tests = [
	["div", [ [ { type: 'tag', name: 'div' } ] ], "simple tag"],
	["*", 	[ [ { type: 'universal' } ] ], "universal"],
	
	//traversal
	["div div", [ [ { type: 'tag', name: 'div' },
    { type: 'descendant' },
    { type: 'tag', name: 'div' } ] ], "descendant"],
    ["div\t \n \tdiv", [ [ { type: 'tag', name: 'div' },
    { type: 'descendant' },
    { type: 'tag', name: 'div' } ] ], "descendant /w whitespace"],
    ["div + div", [ [ { type: 'tag', name: 'div' },
    { type: 'adjacent' },
    { type: 'tag', name: 'div' } ] ], "adjacent"],
    ["div ~ div", [ [ { type: 'tag', name: 'div' },
    { type: 'sibling' },
    { type: 'tag', name: 'div' } ] ], "sibling"],
    
    //attributes
    [".foo", [ [ { type: 'class', value: 'foo' } ] ], "simple class"],
    ["[name^='foo[']",[[{"type":"attribute","name":"name","action":"start","value":"foo[","ignoreCase":false}]],"escaped attribute"],
    ["[name^='foo[bar]']",[[{"type":"attribute","name":"name","action":"start","value":"foo[bar]","ignoreCase":false}]],"escaped attribute"],
    ["[name$='[bar]']",[[{"type":"attribute","name":"name","action":"end","value":"[bar]","ignoreCase":false}]],"escaped attribute"],
    ["[href *= 'google']",[[{"type":"attribute","name":"href","action":"any","value":"google","ignoreCase":false}]],"escaped attribute"],
    ["[name=foo\\.baz]",[[{"type":"attribute","name":"name","action":"equals","value":"foo.baz","ignoreCase":false}]],"escaped attribute"],
    ["[name=foo\\[bar\\]]",[[{"type":"attribute","name":"name","action":"equals","value":"foo[bar]","ignoreCase":false}]],"escaped attribute"],
    ["[xml\\:test]",[[{"type":"attribute","name":"xml:test","action":"exists","value":"","ignoreCase":false}]],"escaped attribute"]
    
    //TODO
];

tests.forEach(function(arr){
	arr[0] = CSSwhat(arr[0]);
	deepEquals.apply(null, arr);
	console.log(arr[2], "passed");
});