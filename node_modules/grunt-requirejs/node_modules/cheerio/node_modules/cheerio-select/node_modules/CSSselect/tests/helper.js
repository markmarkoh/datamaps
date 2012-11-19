var Parser = require("htmlparser2/lib/Parser.js"),
	Handler = require("htmlparser2/lib/DomHandler.js"),
	CSSselect = require("../");

module.exports = {
	CSSselect: CSSselect,
	getFile: function(name){
		return module.exports.getDOM(
			require("fs").readFileSync(__dirname + "/docs/" + name).toString()
		);
	},
	getDOM: function(data){
		var h = new Handler({refParent: true, ignoreWhitespace: true}),
			p = new Parser(h);
		
		p.write(data);
		p.end();
		
		return h.dom;
	},
	getDefaultDom: function(){
		return module.exports.getDOM(
			"<elem id=foo><elem class='bar baz'><tag class='boom'> This is some simple text </tag></elem></elem>"
		);
	}
};