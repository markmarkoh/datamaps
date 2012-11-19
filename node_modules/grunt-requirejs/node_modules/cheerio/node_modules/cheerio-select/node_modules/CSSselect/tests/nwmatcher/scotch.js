/*
	taken from https://github.com/dperini/nwmatcher/blob/master/test/scotch/test.js
*/

"use strict";

var expect = require("expect.js"),
	DomUtils = require("htmlparser2").DomUtils,
	helper = require("../helper.js"),
	document = helper.getDOM(require("fs").readFileSync(__dirname + "/test.html")+""),
	CSSselect = helper.CSSselect;

//Prototype's `$` function
function getById(element){
	if(arguments.length === 1){
		if(typeof element === "string"){
			return DomUtils.getElementById(element, document);
		}
		return element;
	}
	else return Array.prototype.map.call(arguments, function(elem){
			return getById(elem);
		});
}

function assertEquivalent(a, b, msg){
	expect(a).to.be.eql(b);
}

function assertEqual(a, b, msg){
	expect(a).to.be(b);
}

function assert(a, msg){
	expect(a).to.be.ok();
}

function refute(a, msg){
	expect(a).to.not.be.ok();
}

//NWMatcher methods
var select = function(query, doc){
	if(arguments.length === 1 || typeof doc === "undefined") doc = document;
	else if(typeof doc === "string") doc = select(doc);
	return CSSselect.iterate(query, doc);
}, match = CSSselect.is;

//The tests...
module.exports = {
	"Basic Selectors": {
		/*
		"*": function(){
			//Universal selector
			var results = DomUtils.getElementsByTagName("*", document);
			assertEquivalent(select("*"), results, "Comment nodes should be ignored.");
		},
		*/
		"E": function(){
			//Type selector
			var results = [], index = 0, nodes = DomUtils.getElementsByTagName("li", document);
			while((results[index] = nodes[index++])){}
			results.length--;
			assertEquivalent(select("li"), results);
			assertEqual(select("strong", getById("fixtures"))[0], getById("strong"));
			assertEquivalent(select("nonexistent"), []);
		},
		"#id": function(){
			//ID selector
			assertEqual(select("#fixtures")[0], getById("fixtures"));
			assertEquivalent(select("nonexistent"), []);
			assertEqual(select("#troubleForm")[0], getById("troubleForm"));
		},
		".class": function(){
			//Class selector
			assertEquivalent(select(".first"), getById('p', 'link_1', 'item_1'));
			assertEquivalent(select(".second"), []);
		},
		"E#id": function(){
			assertEqual(select("strong#strong")[0], getById("strong"));
			assertEquivalent(select("p#strong"), []);
		},
		"E.class": function(){
			var secondLink = getById("link_2");
			assertEquivalent(select('a.internal'), getById('link_1', 'link_2'));
			assertEqual(select('a.internal.highlight')[0], secondLink);
			assertEqual(select('a.highlight.internal')[0], secondLink);
			assertEquivalent(select('a.highlight.internal.nonexistent'), []);
		},
		"#id.class": function(){
			var secondLink = getById('link_2');
			assertEqual(select('#link_2.internal')[0], secondLink);
			assertEqual(select('.internal#link_2')[0], secondLink);
			assertEqual(select('#link_2.internal.highlight')[0], secondLink);
			assertEquivalent(select('#link_2.internal.nonexistent'), []);
		},
		"E#id.class": function(){
			var secondLink = getById('link_2');
			assertEqual(select('a#link_2.internal')[0], secondLink);
			assertEqual(select('a.internal#link_2')[0], secondLink);
			assertEqual(select('li#item_1.first')[0], getById("item_1"));
			assertEquivalent(select('li#item_1.nonexistent'), []);
			assertEquivalent(select('li#item_1.first.nonexistent'), []);
		}
	},
	
	"Attribute Selectors": {
		"[foo]": function(){
			var body = DomUtils.getElementsByTagName("body", document, true, 1)[0];
			assertEquivalent(select('[href]', body), select('a[href]', body));
			assertEquivalent(select('[class~=internal]'), select('a[class~="internal"]'));
			assertEquivalent(select('[id]'), select('*[id]'));
			assertEquivalent(select('[type=radio]'), getById('checked_radio', 'unchecked_radio'));
			assertEquivalent(select('[type=checkbox]'), select('*[type=checkbox]'));
			assertEquivalent(select('[title]'), getById('with_title', 'commaParent'));
			assertEquivalent(select('#troubleForm [type=radio]'), select('#troubleForm *[type=radio]'));
			assertEquivalent(select('#troubleForm [type]'), select('#troubleForm *[type]'));
		},
		"E[foo]": function(){
			assertEquivalent(select('h1[class]'), select('#fixtures h1'), "h1[class]");
			//assertEquivalent(select('h1[CLASS]'), select('#fixtures h1'), "h1[CLASS]");
			assertEqual(select('li#item_3[class]')[0], getById('item_3'), "li#item_3[class]");
			assertEquivalent(select('#troubleForm2 input[name="brackets[5][]"]'), getById('chk_1', 'chk_2'));
			//Brackets in attribute value
			assertEqual(select('#troubleForm2 input[name="brackets[5][]"]:checked')[0], getById('chk_1'));
			//Space in attribute value
			assertEqual(select('cite[title="hello world!"]')[0], getById('with_title'));
			/*
			//Namespaced attributes
			assertEquivalent(select('[xml:lang]'), [document, getById("item_3")]);
			assertEquivalent(select('*[xml:lang]'), [document, getById("item_3")]);
			*/
		},
		'E[foo="bar"]': function(){
			assertEquivalent(select('a[href="#"]'), getById('link_1', 'link_2', 'link_3'));
			/*this.assertThrowsException(/SYNTAX_ERR/, function(){
				select('a[href=#]');
			});*/
			assertEqual(select('#troubleForm2 input[name="brackets[5][]"][value="2"]')[0], getById('chk_2'));
		},
		'E[foo~="bar"]': function(){
			assertEquivalent(select('a[class~="internal"]'), getById('link_1', 'link_2'), "a[class~=\"internal\"]");
			assertEquivalent(select('a[class~=internal]'), getById('link_1', 'link_2'), "a[class~=internal]");
			assertEqual(select('a[class~=external][href="#"]')[0], getById('link_3'), 'a[class~=external][href="#"]');
		},
		/*
		'E[foo|="en"]': function(){
			assertEqual(select('*[xml:lang|="es"]')[0], getById('item_3'));
			assertEqual(select('*[xml:lang|="ES"]')[0], getById('item_3'));
		},
		*/
		'E[foo^="bar"]': function(){
			assertEquivalent(select('div[class^=bro]'), getById('father', 'uncle'), 'matching beginning of string');
			assertEquivalent(select('#level1 *[id^="level2_"]'), getById('level2_1', 'level2_2', 'level2_3'));
			assertEquivalent(select('#level1 *[id^=level2_]'), getById('level2_1', 'level2_2', 'level2_3'));
		},
		'E[foo$="bar"]': function(){
			assertEquivalent(select('div[class$=men]'), getById('father', 'uncle'), 'matching end of string');
			assertEquivalent(select('#level1 *[id$="_1"]'), getById('level2_1', 'level3_1'));
			assertEquivalent(select('#level1 *[id$=_1]'), getById('level2_1', 'level3_1'));
		},
		'E[foo*="bar"]': function(){
			assertEquivalent(select('div[class*="ers m"]'), getById('father', 'uncle'), 'matching substring');
			assertEquivalent(select('#level1 *[id*="2"]'), getById('level2_1', 'level3_2', 'level2_2', 'level2_3'));
			/*this.assertThrowsException(/SYNTAX_ERR/, function(){
				select('#level1 *[id*=2]');
			});*/
		}

	// *** these should throw SYNTAX_ERR ***

		/*'E[id=-1]': function(){
			this.assertThrowsException(/SYNTAX_ERR/, function(){
				select('#level1 *[id=-1]');
			});
		},
		'E[class=-45deg]': function(){
			this.assertThrowsException(/SYNTAX_ERR/, function(){
				select('#level1 *[class=-45deg]');
			});
		},
		'E[class=8mm]': function(){
			this.assertThrowsException(/SYNTAX_ERR/, function(){
				select('#level1 *[class=8mm]');
			});
		}*/

	},
	
	"Structural pseudo-classes": {
		"E:first-child": function(){
			assertEqual(select('#level1>*:first-child')[0], getById('level2_1'));
			assertEquivalent(select('#level1 *:first-child'), getById('level2_1', 'level3_1', 'level_only_child'));
			assertEquivalent(select('#level1>div:first-child'), []);
			assertEquivalent(select('#level1 span:first-child'), getById('level2_1', 'level3_1'));
			assertEquivalent(select('#level1:first-child'), []);
		},
		"E:last-child": function(){
			assertEqual(select('#level1>*:last-child')[0], getById('level2_3'));
			assertEquivalent(select('#level1 *:last-child'), getById('level3_2', 'level_only_child', 'level2_3'));
			assertEqual(select('#level1>div:last-child')[0], getById('level2_3'));
			assertEqual(select('#level1 div:last-child')[0], getById('level2_3'));
			assertEquivalent(select('#level1>span:last-child'), []);
		},
		"E:nth-child(n)": function(){
			assertEqual(select('#p *:nth-child(3)')[0], getById('link_2'));
			assertEqual(select('#p a:nth-child(3)')[0], getById('link_2'), 'nth-child');
			assertEquivalent(select('#list > li:nth-child(n+2)'), getById('item_2', 'item_3'));
			assertEquivalent(select('#list > li:nth-child(-n+2)'), getById('item_1', 'item_2'));
		},
		"E:nth-of-type(n)": function(){
			assertEqual(select('#p a:nth-of-type(2)')[0], getById('link_2'), 'nth-of-type');
			assertEqual(select('#p a:nth-of-type(1)')[0], getById('link_1'), 'nth-of-type');
		},
		"E:nth-last-of-type(n)": function(){
			assertEqual(select('#p a:nth-last-of-type(1)')[0], getById('link_2'), 'nth-last-of-type');
		},
		"E:first-of-type": function(){
			assertEqual(select('#p a:first-of-type')[0], getById('link_1'), 'first-of-type');
		},
		"E:last-of-type": function(){
			assertEqual(select('#p a:last-of-type')[0], getById('link_2'), 'last-of-type');
		},
		"E:only-child": function(){
			assertEqual(select('#level1 *:only-child')[0], getById('level_only_child'));
			//Shouldn't return anything
			assertEquivalent(select('#level1>*:only-child'), []);
			assertEquivalent(select('#level1:only-child'), []);
			assertEquivalent(select('#level2_2 :only-child:not(:last-child)'), []);
			assertEquivalent(select('#level2_2 :only-child:not(:first-child)'), []);
		}/*,
		"E:empty": function(){
			getById('level3_1').children = [];
			assertEquivalent(select('#level1 *:empty'), getById('level3_1', 'level3_2', 'level2_3'), '#level1 *:empty');
			assertEquivalent(select('#level_only_child:empty'), [], 'newlines count as content!');
			//Shouldn't return anything
			assertEquivalent(select('span:empty > *'), []);
		}*/
	},
	
	"E:not(s)": function(){
		//Negation pseudo-class
		assertEquivalent(select('a:not([href="#"])'), []);
		assertEquivalent(select('div.brothers:not(.brothers)'), []);
		assertEquivalent(select('a[class~=external]:not([href="#"])'), [], 'a[class~=external][href!="#"]');
		assertEqual(select('#p a:not(:first-of-type)')[0], getById('link_2'), 'first-of-type');
		assertEqual(select('#p a:not(:last-of-type)')[0], getById('link_1'), 'last-of-type');
		assertEqual(select('#p a:not(:nth-of-type(1))')[0], getById('link_2'), 'nth-of-type');
		assertEqual(select('#p a:not(:nth-last-of-type(1))')[0], getById('link_1'), 'nth-last-of-type');
		assertEqual(select('#p a:not([rel~=nofollow])')[0], getById('link_2'), 'attribute 1');
		assertEqual(select('#p a:not([rel^=external])')[0], getById('link_2'), 'attribute 2');
		assertEqual(select('#p a:not([rel$=nofollow])')[0], getById('link_2'), 'attribute 3');
		assertEqual(select('#p a:not([rel$="nofollow"]) > em')[0], getById('em'), 'attribute 4');
		assertEqual(select('#list li:not(#item_1):not(#item_3)')[0], getById('item_2'), 'adjacent :not clauses');
		assertEqual(select('#grandfather > div:not(#uncle) #son')[0], getById('son'));
		assertEqual(select('#p a:not([rel$="nofollow"]) em')[0], getById('em'), 'attribute 4 + all descendants');
		assertEqual(select('#p a:not([rel$="nofollow"])>em')[0], getById('em'), 'attribute 4 (without whitespace)');
	},
	
	"UI element states pseudo-classes": {
		"E:disabled": function(){
			assertEqual(select('#troubleForm > p > *:disabled')[0], getById('disabled_text_field'));
		},
		"E:checked": function(){
			assertEquivalent(select('#troubleForm *:checked'), getById('checked_box', 'checked_radio'));
		}
	},
	
	"Combinators": {
		"E F": function(){
			//Descendant
			assertEquivalent(select('#fixtures a *'), getById('em2', 'em', 'span'));
			assertEqual(select('div#fixtures p')[0], getById("p"));
		},
		"E + F": function(){
			//Adjacent sibling
			assertEqual(select('div.brothers + div.brothers')[0], getById("uncle"));
			assertEqual(select('div.brothers + div')[0], getById('uncle'));
			assertEqual(select('#level2_1+span')[0], getById('level2_2'));
			assertEqual(select('#level2_1 + span')[0], getById('level2_2'));
			assertEqual(select('#level2_1 + *')[0], getById('level2_2'));
			assertEquivalent(select('#level2_2 + span'), []);
			assertEqual(select('#level3_1 + span')[0], getById('level3_2'));
			assertEqual(select('#level3_1 + *')[0], getById('level3_2'));
			assertEquivalent(select('#level3_2 + *'), []);
			assertEquivalent(select('#level3_1 + em'), []);
		},
		"E > F": function(){
			//Child
			assertEquivalent(select('p.first > a'), getById('link_1', 'link_2'));
			assertEquivalent(select('div#grandfather > div'), getById('father', 'uncle'));
			assertEquivalent(select('#level1>span'), getById('level2_1', 'level2_2'));
			assertEquivalent(select('#level1 > span'), getById('level2_1', 'level2_2'));
			assertEquivalent(select('#level2_1 > *'), getById('level3_1', 'level3_2'));
			assertEquivalent(select('div > #nonexistent'), []);
		},
		"E ~ F": function(){
			//General sibling
			assertEqual(select('h1 ~ ul')[0], getById('list'));
			assertEquivalent(select('#level2_2 ~ span'), []);
			assertEquivalent(select('#level3_2 ~ *'), []);
			assertEquivalent(select('#level3_1 ~ em'), []);
			assertEquivalent(select('div ~ #level3_2'), []);
			assertEquivalent(select('div ~ #level2_3'), []);
			assertEqual(select('#level2_1 ~ span')[0], getById('level2_2'));
			assertEquivalent(select('#level2_1 ~ *'), getById('level2_2', 'level2_3'));
			assertEqual(select('#level3_1 ~ #level3_2')[0], getById('level3_2'));
			assertEqual(select('span ~ #level3_2')[0], getById('level3_2'));
		}
	},
	
	"NW.Dom.match": function(){
		var element = getById('dupL1');
		//Assertions
		assert(match(element, 'span'));
		assert(match(element, "span#dupL1"));
		assert(match(element, "div > span"), "child combinator");
		assert(match(element, "#dupContainer span"), "descendant combinator");
		assert(match(element, "#dupL1"), "ID only");
		assert(match(element, "span.span_foo"), "class name 1");
		assert(match(element, "span.span_bar"), "class name 2");
		assert(match(element, "span:first-child"), "first-child pseudoclass");
		//Refutations
		refute(match(element, "span.span_wtf"), "bogus class name");
		refute(match(element, "#dupL2"), "different ID");
		refute(match(element, "div"), "different tag name");
		refute(match(element, "span span"), "different ancestry");
		refute(match(element, "span > span"), "different parent");
		refute(match(element, "span:nth-child(5)"), "different pseudoclass");
		//Misc.
		refute(match(getById('link_2'), 'a[rel^=external]'));
		assert(match(getById('link_1'), 'a[rel^=external]'));
		assert(match(getById('link_1'), 'a[rel^="external"]'));
		assert(match(getById('link_1'), "a[rel^='external']"));
	},
	"Equivalent Selectors": function(){
		assertEquivalent(select('div.brothers'), select('div[class~=brothers]'));
		assertEquivalent(select('div.brothers'), select('div[class~=brothers].brothers'));
		assertEquivalent(select('div:not(.brothers)'), select('div:not([class~=brothers])'));
		assertEquivalent(select('li ~ li'), select('li:not(:first-child)'));
		assertEquivalent(select('ul > li'), select('ul > li:nth-child(n)'));
		assertEquivalent(select('ul > li:nth-child(even)'), select('ul > li:nth-child(2n)'));
		assertEquivalent(select('ul > li:nth-child(odd)'), select('ul > li:nth-child(2n+1)'));
		assertEquivalent(select('ul > li:first-child'), select('ul > li:nth-child(1)'));
		assertEquivalent(select('ul > li:last-child'), select('ul > li:nth-last-child(1)'));
		/* Opera 10 does not accept values > 128 as a parameter to :nth-child
		See <http://operawiki.info/ArtificialLimits> */
		assertEquivalent(select('ul > li:nth-child(n-128)'), select('ul > li'));
		assertEquivalent(select('ul>li'), select('ul > li'));
		assertEquivalent(select('#p a:not([rel$="nofollow"])>em'), select('#p a:not([rel$="nofollow"]) > em'));
	},
	"Multiple Selectors": function(){
		//The next two assertions should return document-ordered lists of matching elements --Diego Perini
		//assertEquivalent(select('#list, .first,*[xml:lang="es-us"] , #troubleForm'), getById('p', 'link_1', 'list', 'item_1', 'item_3', 'troubleForm'));
		//assertEquivalent(select('#list, .first, *[xml:lang="es-us"], #troubleForm'), getById('p', 'link_1', 'list', 'item_1', 'item_3', 'troubleForm'));
		assertEquivalent(select('form[title*="commas,"], input[value="#commaOne,#commaTwo"]'), getById('commaParent', 'commaChild'));
		assertEquivalent(select('form[title*="commas,"], input[value="#commaOne,#commaTwo"]'), getById('commaParent', 'commaChild'));
	}
};