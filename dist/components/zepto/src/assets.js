//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function(e){var t=[],n;e.fn.remove=function(){return this.each(function(){this.parentNode&&(this.tagName==="IMG"&&(t.push(this),this.src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",n&&clearTimeout(n),n=setTimeout(function(){t=[]},6e4)),this.parentNode.removeChild(this))})}})(Zepto)