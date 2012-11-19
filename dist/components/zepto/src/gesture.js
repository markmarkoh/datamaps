//     Zepto.js
//     (c) 2010-2012 Thomas Fuchs
//     Zepto.js may be freely distributed under the MIT license.

(function(e){if(e.os.ios){var t={},n;function r(e){return"tagName"in e?e:e.parentNode}e(document).bind("gesturestart",function(e){var i=Date.now(),s=i-(t.last||i);t.target=r(e.target),n&&clearTimeout(n),t.e1=e.scale,t.last=i}).bind("gesturechange",function(e){t.e2=e.scale}).bind("gestureend",function(n){t.e2>0?(Math.abs(t.e1-t.e2)!=0&&e(t.target).trigger("pinch")&&e(t.target).trigger("pinch"+(t.e1-t.e2>0?"In":"Out")),t.e1=t.e2=t.last=0):"last"in t&&(t={})}),["pinch","pinchIn","pinchOut"].forEach(function(t){e.fn[t]=function(e){return this.bind(t,e)}})}})(Zepto)