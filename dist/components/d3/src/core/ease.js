/*
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of the author nor the names of contributors may be used to
 *   endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

function d3_ease_clamp(e){return function(t){return t<=0?0:t>=1?1:e(t)}}function d3_ease_reverse(e){return function(t){return 1-e(1-t)}}function d3_ease_reflect(e){return function(t){return.5*(t<.5?e(2*t):2-e(2-2*t))}}function d3_ease_identity(e){return e}function d3_ease_poly(e){return function(t){return Math.pow(t,e)}}function d3_ease_sin(e){return 1-Math.cos(e*Math.PI/2)}function d3_ease_exp(e){return Math.pow(2,10*(e-1))}function d3_ease_circle(e){return 1-Math.sqrt(1-e*e)}function d3_ease_elastic(e,t){var n;return arguments.length<2&&(t=.45),arguments.length<1?(e=1,n=t/4):n=t/(2*Math.PI)*Math.asin(1/e),function(r){return 1+e*Math.pow(2,10*-r)*Math.sin((r-n)*2*Math.PI/t)}}function d3_ease_back(e){return e||(e=1.70158),function(t){return t*t*((e+1)*t-e)}}function d3_ease_bounce(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375}var d3_ease_quad=d3_ease_poly(2),d3_ease_cubic=d3_ease_poly(3),d3_ease_default=function(){return d3_ease_identity},d3_ease=d3.map({linear:d3_ease_default,poly:d3_ease_poly,quad:function(){return d3_ease_quad},cubic:function(){return d3_ease_cubic},sin:function(){return d3_ease_sin},exp:function(){return d3_ease_exp},circle:function(){return d3_ease_circle},elastic:d3_ease_elastic,back:d3_ease_back,bounce:function(){return d3_ease_bounce}}),d3_ease_mode=d3.map({"in":d3_ease_identity,out:d3_ease_reverse,"in-out":d3_ease_reflect,"out-in":function(e){return d3_ease_reflect(d3_ease_reverse(e))}});d3.ease=function(e){var t=e.indexOf("-"),n=t>=0?e.substring(0,t):e,r=t>=0?e.substring(t+1):"in";return n=d3_ease.get(n)||d3_ease_default,r=d3_ease_mode.get(r)||d3_ease_identity,d3_ease_clamp(r(n.apply(null,Array.prototype.slice.call(arguments,1))))}