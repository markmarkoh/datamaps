var ElementType = require("domelementtype"),
    DomUtils = module.exports;

function find(test, arr, recurse, limit){
	var result = [], childs;

	for(var i = 0, j = arr.length; i < j; i++){
		if(test(arr[i])){
			result.push(arr[i]);
			if(--limit <= 0) break;
		}

		childs = arr[i].children;
		if(recurse && childs && childs.length > 0){
			childs = find(test, childs, recurse, limit);
			result = result.concat(childs);
			limit -= childs.length;
			if(limit <= 0) break;
		}
	}

	return result;
}

function findOne(test, arr, recurse){
	for(var i = 0, l = arr.length; i < l; i++){
		if(test(arr[i])) return arr[i];
		if(recurse && arr[i].children && arr[i].children.length > 0){
			var elem = findOne(test, arr[i].children, true);
			if(elem) return elem;
		}
	}
	return null;
}

function findAll(test, arr){
	return arr.reduce(function(arr, elem){
		if(elem.children && elem.children.length > 0){
			return arr.concat(findAll(test, elem.children));
		} else {
			return arr;
		}
	}, arr.filter(test));
}

var isTag = DomUtils.isTag = function(elem){
	return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
};

function filter(test, element, recurse, limit){
	if(!Array.isArray(element)) element = [element];

	if(typeof limit !== "number" || limit === Infinity){
		if(recurse === false){
			return element.filter(test);
		} else {
			return findAll(test, element);
		}
	} else if(limit === 1){
		element = findOne(test, element, recurse !== false);
		return element ? [element] : [];
	} else {
		return find(test, element, recurse !== false, limit);
	}
}

DomUtils.filter = filter;

DomUtils.testElement = function(options, element){
	for(var key in options){
		if(!options.hasOwnProperty(key));
		else if(key === "tag_name"){
		    if(!isTag(element) || !options.tag_name(element.name)){
				return false;
		    }
		} else if(key === "tag_type"){
		    if(!options.tag_type(element.type)) return false;
		} else if(key === "tag_contains"){
		    if(isTag(element) || !options.tag_contains(element.data)){
				return false;
		    }
		} else if(!element.attribs || !options[key](element.attribs[key])){
			return false;
		}
	}
	return true;
};

var Checks = {
	tag_name: function(name){
		if(typeof name === "function"){ 
			return function(elem){ return isTag(elem) && name(elem.name); };
		} else if(name === "*"){
			return isTag;
		} else {
			return function(elem){ return isTag(elem) && elem.name === name; };
		}
	},
	tag_type: function(type){
		if(typeof type === "function"){
			return function(elem){ return type(elem.type); };
		} else {
			return function(elem){ return elem.type === type; };
		}
	},
	tag_contains: function(data){
		if(typeof type === "function"){
			return function(elem){ return !isTag(elem) && data(elem.data); };
		} else {
			return function(elem){ return !isTag(elem) && elem.data === data; };
		}
	}
};

function getAttribCheck(attrib, value){
	if(typeof value === "function"){
		return function(elem){ return elem.attribs && value(elem.attribs[attrib]); };
	} else {
		return function(elem){ return elem.attribs && elem.attribs[attrib] === value; };
	}
}

DomUtils.getElements = function(options, element, recurse, limit){
	var funcs = [];
	for(var key in options){
		if(options.hasOwnProperty(key)){
			if(key in Checks) funcs.push(Checks[key](options[key]));
			else funcs.push(getAttribCheck(key, options[key]));
		}
	}

	if(funcs.length === 0) return [];
	if(funcs.length === 1) return filter(funcs[0], element, recurse, limit);
	return filter(
		function(elem){
			return funcs.some(function(func){ return func(elem); });
		},
		element, recurse, limit
	);
};

DomUtils.getElementById = function(id, element, recurse){
	if(!Array.isArray(element)) element = [element];
	return findOne(getAttribCheck("id", id), element, recurse !== false);
};

DomUtils.getElementsByTagName = function(name, element, recurse, limit){
	return filter(Checks.tag_name(name), element, recurse, limit);
};

DomUtils.getElementsByTagType = function(type, element, recurse, limit){
	return filter(Checks.tag_type(type), element, recurse, limit);
};

DomUtils.removeElement = function(elem){
	if(elem.prev) elem.prev.next = elem.next;
	if(elem.next) elem.next.prev = elem.prev;

	if(elem.parent){
		elem.parent.children.splice(elem.parent.children.lastIndexOf(elem), 1);
	}
};

DomUtils.getInnerHTML = function(elem){
	if(!elem.children) return "";

	var childs = elem.children,
		childNum = childs.length,
		ret = "";

	for(var i = 0; i < childNum; i++){
		ret += DomUtils.getOuterHTML(childs[i]);
	}

	return ret;
};

//boolean attributes without a value (taken from MatthewMueller/cheerio)
var booleanAttribs = {
	__proto__: null,
	async: true,
	autofocus: true,
	autoplay: true,
	checked: true,
	controls: true,
	defer: true,
	disabled: true,
	hidden: true,
	loop: true,
	multiple: true,
	open: true,
	readonly: true,
	required: true,
	scoped: true,
	selected: true,
	"/": true //TODO when is this required?
};

DomUtils.getOuterHTML = function(elem){
	var type = elem.type;

	if(type === ElementType.Text) return elem.data;
	if(type === ElementType.Comment) return "<!--" + elem.data + "-->";
	if(type === ElementType.Directive) return "<" + elem.data + ">";
	if(type === ElementType.CDATA) return "<!CDATA " + elem.data + "]]>";

	var ret = "<" + elem.name;
	if("attribs" in elem){
		for(var attr in elem.attribs){
			if(elem.attribs.hasOwnProperty(attr)){
				ret += " " + attr;
				var value = elem.attribs[attr];
				if(!value){
					if( !(attr in booleanAttribs) ){
						ret += '=""';
					}
				} else {
					ret += '="' + value + '"';
				}
			}
		}
	}
	return ret + ">" + DomUtils.getInnerHTML(elem) + "</" + elem.name + ">";
};