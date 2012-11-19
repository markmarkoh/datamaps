function isElement(elem){
	return elem.nodeType === 1;
}
function getSiblings(elem){
	var parent = getParent(elem);
	return parent && getChildren(parent);
}
function getChildren(elem){
	return elem.childNodes;
}
function getParent(elem){
	return elem.parentElement;
}
function getAttributeValue(elem, name){
	return elem.attributes[name].value;
}
function hasAttrib(elem, name){
	return name in elem.attributes;
}
function getName(elem){
	return elem.tagName.toLowerCase();
}
//https://github.com/ded/qwery/blob/master/pseudos/qwery-pseudos.js#L47-54
function getText(elem) {
	var str = "",
	    childs = getChildren(elem);

	if(!childs) return str;

	for(var i = 0; i < childs.length){
		if(isElem(childs[i]) str += el.textContent || el.innerText || getText(childs[i])
	}

	return s;
}