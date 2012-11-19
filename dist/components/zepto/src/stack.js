//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function(e){e.fn.end=function(){return this.prevObject||e()},e.fn.andSelf=function(){return this.add(this.prevObject||e())},"filter,add,not,eq,first,last,find,closest,parents,parent,children,siblings".split(",").forEach(function(t){var n=e.fn[t];e.fn[t]=function(){var e=n.apply(this,arguments);return e.prevObject=this,e}})})(Zepto)