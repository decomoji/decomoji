﻿/*!
 * https://github.com/es-shims/es5-shim
 * @license es5-shim Copyright 2009-2015 by contributors, MIT License
 * see https://github.com/es-shims/es5-shim/blob/master/LICENSE
 */
(function(t,r){"use strict";if(typeof define==="function"&&define.amd){define(r)}else if(typeof exports==="object"){module.exports=r()}else{t.returnExports=r()}})(this,function(){var t=Array;var r=t.prototype;var e=Object;var n=e.prototype;var i=Function;var a=i.prototype;var o=String;var f=o.prototype;var u=Number;var l=u.prototype;var s=r.slice;var c=r.splice;var v=r.push;var h=r.unshift;var p=r.concat;var y=r.join;var d=a.call;var g=a.apply;var w=Math.max;var b=Math.min;var T=n.toString;var m=typeof Symbol==="function"&&typeof Symbol.toStringTag==="symbol";var D;var S=Function.prototype.toString,x=/^\s*class /,O=function isES6ClassFn(t){try{var r=S.call(t);var e=r.replace(/\/\/.*\n/g,"");var n=e.replace(/\/\*[.\s\S]*\*\//g,"");var i=n.replace(/\n/gm," ").replace(/ {2}/g," ");return x.test(i)}catch(a){return false}},E=function tryFunctionObject(t){try{if(O(t)){return false}S.call(t);return true}catch(r){return false}},j="[object Function]",I="[object GeneratorFunction]",D=function isCallable(t){if(!t){return false}if(typeof t!=="function"&&typeof t!=="object"){return false}if(m){return E(t)}if(O(t)){return false}var r=T.call(t);return r===j||r===I};var M;var U=RegExp.prototype.exec,$=function tryRegexExec(t){try{U.call(t);return true}catch(r){return false}},F="[object RegExp]";M=function isRegex(t){if(typeof t!=="object"){return false}return m?$(t):T.call(t)===F};var N;var C=String.prototype.valueOf,k=function tryStringObject(t){try{C.call(t);return true}catch(r){return false}},A="[object String]";N=function isString(t){if(typeof t==="string"){return true}if(typeof t!=="object"){return false}return m?k(t):T.call(t)===A};var R=e.defineProperty&&function(){try{var t={};e.defineProperty(t,"x",{enumerable:false,value:t});for(var r in t){return false}return t.x===t}catch(n){return false}}();var P=function(t){var r;if(R){r=function(t,r,n,i){if(!i&&r in t){return}e.defineProperty(t,r,{configurable:true,enumerable:false,writable:true,value:n})}}else{r=function(t,r,e,n){if(!n&&r in t){return}t[r]=e}}return function defineProperties(e,n,i){for(var a in n){if(t.call(n,a)){r(e,a,n[a],i)}}}}(n.hasOwnProperty);var J=function isPrimitive(t){var r=typeof t;return t===null||r!=="object"&&r!=="function"};var Y=u.isNaN||function isActualNaN(t){return t!==t};var z={ToInteger:function ToInteger(t){var r=+t;if(Y(r)){r=0}else if(r!==0&&r!==1/0&&r!==-(1/0)){r=(r>0||-1)*Math.floor(Math.abs(r))}return r},ToPrimitive:function ToPrimitive(t){var r,e,n;if(J(t)){return t}e=t.valueOf;if(D(e)){r=e.call(t);if(J(r)){return r}}n=t.toString;if(D(n)){r=n.call(t);if(J(r)){return r}}throw new TypeError},ToObject:function(t){if(t==null){throw new TypeError("can't convert "+t+" to object")}return e(t)},ToUint32:function ToUint32(t){return t>>>0}};var Z=function Empty(){};P(a,{bind:function bind(t){var r=this;if(!D(r)){throw new TypeError("Function.prototype.bind called on incompatible "+r)}var n=s.call(arguments,1);var a;var o=function(){if(this instanceof a){var i=g.call(r,this,p.call(n,s.call(arguments)));if(e(i)===i){return i}return this}else{return g.call(r,t,p.call(n,s.call(arguments)))}};var f=w(0,r.length-n.length);var u=[];for(var l=0;l<f;l++){v.call(u,"$"+l)}a=i("binder","return function ("+y.call(u,",")+"){ return binder.apply(this, arguments); }")(o);if(r.prototype){Z.prototype=r.prototype;a.prototype=new Z;Z.prototype=null}return a}});var G=d.bind(n.hasOwnProperty);var H=d.bind(n.toString);var W=d.bind(s);var B=g.bind(s);if(typeof document==="object"&&document&&document.documentElement){try{W(document.documentElement.childNodes)}catch(X){var L=W;var q=B;W=function arraySliceIE(t){var r=[];var e=t.length;while(e-- >0){r[e]=t[e]}return q(r,L(arguments,1))};B=function arraySliceApplyIE(t,r){return q(W(t),r)}}}var K=d.bind(f.slice);var Q=d.bind(f.split);var V=d.bind(f.indexOf);var _=d.bind(v);var tt=d.bind(n.propertyIsEnumerable);var rt=d.bind(r.sort);var et=t.isArray||function isArray(t){return H(t)==="[object Array]"};var nt=[].unshift(0)!==1;P(r,{unshift:function(){h.apply(this,arguments);return this.length}},nt);P(t,{isArray:et});var it=e("a");var at=it[0]!=="a"||!(0 in it);var ot=function properlyBoxed(t){var r=true;var e=true;var n=false;if(t){try{t.call("foo",function(t,e,n){if(typeof n!=="object"){r=false}});t.call([1],function(){"use strict";e=typeof this==="string"},"x")}catch(i){n=true}}return!!t&&!n&&r&&e};P(r,{forEach:function forEach(t){var r=z.ToObject(this);var e=at&&N(this)?Q(this,""):r;var n=-1;var i=z.ToUint32(e.length);var a;if(arguments.length>1){a=arguments[1]}if(!D(t)){throw new TypeError("Array.prototype.forEach callback must be a function")}while(++n<i){if(n in e){if(typeof a==="undefined"){t(e[n],n,r)}else{t.call(a,e[n],n,r)}}}}},!ot(r.forEach));P(r,{map:function map(r){var e=z.ToObject(this);var n=at&&N(this)?Q(this,""):e;var i=z.ToUint32(n.length);var a=t(i);var o;if(arguments.length>1){o=arguments[1]}if(!D(r)){throw new TypeError("Array.prototype.map callback must be a function")}for(var f=0;f<i;f++){if(f in n){if(typeof o==="undefined"){a[f]=r(n[f],f,e)}else{a[f]=r.call(o,n[f],f,e)}}}return a}},!ot(r.map));P(r,{filter:function filter(t){var r=z.ToObject(this);var e=at&&N(this)?Q(this,""):r;var n=z.ToUint32(e.length);var i=[];var a;var o;if(arguments.length>1){o=arguments[1]}if(!D(t)){throw new TypeError("Array.prototype.filter callback must be a function")}for(var f=0;f<n;f++){if(f in e){a=e[f];if(typeof o==="undefined"?t(a,f,r):t.call(o,a,f,r)){_(i,a)}}}return i}},!ot(r.filter));P(r,{every:function every(t){var r=z.ToObject(this);var e=at&&N(this)?Q(this,""):r;var n=z.ToUint32(e.length);var i;if(arguments.length>1){i=arguments[1]}if(!D(t)){throw new TypeError("Array.prototype.every callback must be a function")}for(var a=0;a<n;a++){if(a in e&&!(typeof i==="undefined"?t(e[a],a,r):t.call(i,e[a],a,r))){return false}}return true}},!ot(r.every));P(r,{some:function some(t){var r=z.ToObject(this);var e=at&&N(this)?Q(this,""):r;var n=z.ToUint32(e.length);var i;if(arguments.length>1){i=arguments[1]}if(!D(t)){throw new TypeError("Array.prototype.some callback must be a function")}for(var a=0;a<n;a++){if(a in e&&(typeof i==="undefined"?t(e[a],a,r):t.call(i,e[a],a,r))){return true}}return false}},!ot(r.some));var ft=false;if(r.reduce){ft=typeof r.reduce.call("es5",function(t,r,e,n){return n})==="object"}P(r,{reduce:function reduce(t){var r=z.ToObject(this);var e=at&&N(this)?Q(this,""):r;var n=z.ToUint32(e.length);if(!D(t)){throw new TypeError("Array.prototype.reduce callback must be a function")}if(n===0&&arguments.length===1){throw new TypeError("reduce of empty array with no initial value")}var i=0;var a;if(arguments.length>=2){a=arguments[1]}else{do{if(i in e){a=e[i++];break}if(++i>=n){throw new TypeError("reduce of empty array with no initial value")}}while(true)}for(;i<n;i++){if(i in e){a=t(a,e[i],i,r)}}return a}},!ft);var ut=false;if(r.reduceRight){ut=typeof r.reduceRight.call("es5",function(t,r,e,n){return n})==="object"}P(r,{reduceRight:function reduceRight(t){var r=z.ToObject(this);var e=at&&N(this)?Q(this,""):r;var n=z.ToUint32(e.length);if(!D(t)){throw new TypeError("Array.prototype.reduceRight callback must be a function")}if(n===0&&arguments.length===1){throw new TypeError("reduceRight of empty array with no initial value")}var i;var a=n-1;if(arguments.length>=2){i=arguments[1]}else{do{if(a in e){i=e[a--];break}if(--a<0){throw new TypeError("reduceRight of empty array with no initial value")}}while(true)}if(a<0){return i}do{if(a in e){i=t(i,e[a],a,r)}}while(a--);return i}},!ut);var lt=r.indexOf&&[0,1].indexOf(1,2)!==-1;P(r,{indexOf:function indexOf(t){var r=at&&N(this)?Q(this,""):z.ToObject(this);var e=z.ToUint32(r.length);if(e===0){return-1}var n=0;if(arguments.length>1){n=z.ToInteger(arguments[1])}n=n>=0?n:w(0,e+n);for(;n<e;n++){if(n in r&&r[n]===t){return n}}return-1}},lt);var st=r.lastIndexOf&&[0,1].lastIndexOf(0,-3)!==-1;P(r,{lastIndexOf:function lastIndexOf(t){var r=at&&N(this)?Q(this,""):z.ToObject(this);var e=z.ToUint32(r.length);if(e===0){return-1}var n=e-1;if(arguments.length>1){n=b(n,z.ToInteger(arguments[1]))}n=n>=0?n:e-Math.abs(n);for(;n>=0;n--){if(n in r&&t===r[n]){return n}}return-1}},st);var ct=function(){var t=[1,2];var r=t.splice();return t.length===2&&et(r)&&r.length===0}();P(r,{splice:function splice(t,r){if(arguments.length===0){return[]}else{return c.apply(this,arguments)}}},!ct);var vt=function(){var t={};r.splice.call(t,0,0,1);return t.length===1}();P(r,{splice:function splice(t,r){if(arguments.length===0){return[]}var e=arguments;this.length=w(z.ToInteger(this.length),0);if(arguments.length>0&&typeof r!=="number"){e=W(arguments);if(e.length<2){_(e,this.length-t)}else{e[1]=z.ToInteger(r)}}return c.apply(this,e)}},!vt);var ht=function(){var r=new t(1e5);r[8]="x";r.splice(1,1);return r.indexOf("x")===7}();var pt=function(){var t=256;var r=[];r[t]="a";r.splice(t+1,0,"b");return r[t]==="a"}();P(r,{splice:function splice(t,r){var e=z.ToObject(this);var n=[];var i=z.ToUint32(e.length);var a=z.ToInteger(t);var f=a<0?w(i+a,0):b(a,i);var u=b(w(z.ToInteger(r),0),i-f);var l=0;var s;while(l<u){s=o(f+l);if(G(e,s)){n[l]=e[s]}l+=1}var c=W(arguments,2);var v=c.length;var h;if(v<u){l=f;var p=i-u;while(l<p){s=o(l+u);h=o(l+v);if(G(e,s)){e[h]=e[s]}else{delete e[h]}l+=1}l=i;var y=i-u+v;while(l>y){delete e[l-1];l-=1}}else if(v>u){l=i-u;while(l>f){s=o(l+u-1);h=o(l+v-1);if(G(e,s)){e[h]=e[s]}else{delete e[h]}l-=1}}l=f;for(var d=0;d<c.length;++d){e[l]=c[d];l+=1}e.length=i-u+v;return n}},!ht||!pt);var yt=r.join;var dt;try{dt=Array.prototype.join.call("123",",")!=="1,2,3"}catch(X){dt=true}if(dt){P(r,{join:function join(t){var r=typeof t==="undefined"?",":t;return yt.call(N(this)?Q(this,""):this,r)}},dt)}var gt=[1,2].join(undefined)!=="1,2";if(gt){P(r,{join:function join(t){var r=typeof t==="undefined"?",":t;return yt.call(this,r)}},gt)}var wt=function push(t){var r=z.ToObject(this);var e=z.ToUint32(r.length);var n=0;while(n<arguments.length){r[e+n]=arguments[n];n+=1}r.length=e+n;return e+n};var bt=function(){var t={};var r=Array.prototype.push.call(t,undefined);return r!==1||t.length!==1||typeof t[0]!=="undefined"||!G(t,0)}();P(r,{push:function push(t){if(et(this)){return v.apply(this,arguments)}return wt.apply(this,arguments)}},bt);var Tt=function(){var t=[];var r=t.push(undefined);return r!==1||t.length!==1||typeof t[0]!=="undefined"||!G(t,0)}();P(r,{push:wt},Tt);P(r,{slice:function(t,r){var e=N(this)?Q(this,""):this;return B(e,arguments)}},at);var mt=function(){try{[1,2].sort(null)}catch(t){try{[1,2].sort({})}catch(r){return false}}return true}();var Dt=function(){try{[1,2].sort(/a/);return false}catch(t){}return true}();var St=function(){try{[1,2].sort(undefined);return true}catch(t){}return false}();P(r,{sort:function sort(t){if(typeof t==="undefined"){return rt(this)}if(!D(t)){throw new TypeError("Array.prototype.sort callback must be a function")}return rt(this,t)}},mt||!St||!Dt);var xt=!tt({toString:null},"toString");var Ot=tt(function(){},"prototype");var Et=!G("x","0");var jt=function(t){var r=t.constructor;return r&&r.prototype===t};var It={$applicationCache:true,$console:true,$external:true,$frame:true,$frameElement:true,$frames:true,$innerHeight:true,$innerWidth:true,$onmozfullscreenchange:true,$onmozfullscreenerror:true,$outerHeight:true,$outerWidth:true,$pageXOffset:true,$pageYOffset:true,$parent:true,$scrollLeft:true,$scrollTop:true,$scrollX:true,$scrollY:true,$self:true,$webkitIndexedDB:true,$webkitStorageInfo:true,$window:true,$width:true,$height:true,$top:true,$localStorage:true};var Mt=function(){if(typeof window==="undefined"){return false}for(var t in window){try{if(!It["$"+t]&&G(window,t)&&window[t]!==null&&typeof window[t]==="object"){jt(window[t])}}catch(r){return true}}return false}();var Ut=function(t){if(typeof window==="undefined"||!Mt){return jt(t)}try{return jt(t)}catch(r){return false}};var $t=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"];var Ft=$t.length;var Nt=function isArguments(t){return H(t)==="[object Arguments]"};var Ct=function isArguments(t){return t!==null&&typeof t==="object"&&typeof t.length==="number"&&t.length>=0&&!et(t)&&D(t.callee)};var kt=Nt(arguments)?Nt:Ct;P(e,{keys:function keys(t){var r=D(t);var e=kt(t);var n=t!==null&&typeof t==="object";var i=n&&N(t);if(!n&&!r&&!e){throw new TypeError("Object.keys called on a non-object")}var a=[];var f=Ot&&r;if(i&&Et||e){for(var u=0;u<t.length;++u){_(a,o(u))}}if(!e){for(var l in t){if(!(f&&l==="prototype")&&G(t,l)){_(a,o(l))}}}if(xt){var s=Ut(t);for(var c=0;c<Ft;c++){var v=$t[c];if(!(s&&v==="constructor")&&G(t,v)){_(a,v)}}}return a}});var At=e.keys&&function(){return e.keys(arguments).length===2}(1,2);var Rt=e.keys&&function(){var t=e.keys(arguments);return arguments.length!==1||t.length!==1||t[0]!==1}(1);var Pt=e.keys;P(e,{keys:function keys(t){if(kt(t)){return Pt(W(t))}else{return Pt(t)}}},!At||Rt);var Jt=new Date(-0xc782b5b342b24).getUTCMonth()!==0;var Yt=new Date(-0x55d318d56a724);var zt=new Date(14496624e5);var Zt=Yt.toUTCString()!=="Mon, 01 Jan -45875 11:59:59 GMT";var Gt;var Ht;var Wt=Yt.getTimezoneOffset();if(Wt<-720){Gt=Yt.toDateString()!=="Tue Jan 02 -45875";Ht=!/^Thu Dec 10 2015 \d\d:\d\d:\d\d GMT[-+]\d\d\d\d(?: |$)/.test(String(zt))}else{Gt=Yt.toDateString()!=="Mon Jan 01 -45875";Ht=!/^Wed Dec 09 2015 \d\d:\d\d:\d\d GMT[-+]\d\d\d\d(?: |$)/.test(String(zt))}var Bt=d.bind(Date.prototype.getFullYear);var Xt=d.bind(Date.prototype.getMonth);var Lt=d.bind(Date.prototype.getDate);var qt=d.bind(Date.prototype.getUTCFullYear);var Kt=d.bind(Date.prototype.getUTCMonth);var Qt=d.bind(Date.prototype.getUTCDate);var Vt=d.bind(Date.prototype.getUTCDay);var _t=d.bind(Date.prototype.getUTCHours);var tr=d.bind(Date.prototype.getUTCMinutes);var rr=d.bind(Date.prototype.getUTCSeconds);var er=d.bind(Date.prototype.getUTCMilliseconds);var nr=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];var ir=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];var ar=function daysInMonth(t,r){return Lt(new Date(r,t,0))};P(Date.prototype,{getFullYear:function getFullYear(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=Bt(this);if(t<0&&Xt(this)>11){return t+1}return t},getMonth:function getMonth(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=Bt(this);var r=Xt(this);if(t<0&&r>11){return 0}return r},getDate:function getDate(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=Bt(this);var r=Xt(this);var e=Lt(this);if(t<0&&r>11){if(r===12){return e}var n=ar(0,t+1);return n-e+1}return e},getUTCFullYear:function getUTCFullYear(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=qt(this);if(t<0&&Kt(this)>11){return t+1}return t},getUTCMonth:function getUTCMonth(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=qt(this);var r=Kt(this);if(t<0&&r>11){return 0}return r},getUTCDate:function getUTCDate(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=qt(this);var r=Kt(this);var e=Qt(this);if(t<0&&r>11){if(r===12){return e}var n=ar(0,t+1);return n-e+1}return e}},Jt);P(Date.prototype,{toUTCString:function toUTCString(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=Vt(this);var r=Qt(this);var e=Kt(this);var n=qt(this);var i=_t(this);var a=tr(this);var o=rr(this);return nr[t]+", "+(r<10?"0"+r:r)+" "+ir[e]+" "+n+" "+(i<10?"0"+i:i)+":"+(a<10?"0"+a:a)+":"+(o<10?"0"+o:o)+" GMT"}},Jt||Zt);P(Date.prototype,{toDateString:function toDateString(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=this.getDay();var r=this.getDate();var e=this.getMonth();var n=this.getFullYear();return nr[t]+" "+ir[e]+" "+(r<10?"0"+r:r)+" "+n}},Jt||Gt);if(Jt||Ht){Date.prototype.toString=function toString(){if(!this||!(this instanceof Date)){throw new TypeError("this is not a Date object.")}var t=this.getDay();var r=this.getDate();var e=this.getMonth();var n=this.getFullYear();var i=this.getHours();var a=this.getMinutes();var o=this.getSeconds();var f=this.getTimezoneOffset();var u=Math.floor(Math.abs(f)/60);var l=Math.floor(Math.abs(f)%60);return nr[t]+" "+ir[e]+" "+(r<10?"0"+r:r)+" "+n+" "+(i<10?"0"+i:i)+":"+(a<10?"0"+a:a)+":"+(o<10?"0"+o:o)+" GMT"+(f>0?"-":"+")+(u<10?"0"+u:u)+(l<10?"0"+l:l)};if(R){e.defineProperty(Date.prototype,"toString",{configurable:true,enumerable:false,writable:true})}}var or=-621987552e5;var fr="-000001";var ur=Date.prototype.toISOString&&new Date(or).toISOString().indexOf(fr)===-1;var lr=Date.prototype.toISOString&&new Date(-1).toISOString()!=="1969-12-31T23:59:59.999Z";var sr=d.bind(Date.prototype.getTime);P(Date.prototype,{toISOString:function toISOString(){if(!isFinite(this)||!isFinite(sr(this))){throw new RangeError("Date.prototype.toISOString called on non-finite value.")}var t=qt(this);var r=Kt(this);t+=Math.floor(r/12);r=(r%12+12)%12;var e=[r+1,Qt(this),_t(this),tr(this),rr(this)];t=(t<0?"-":t>9999?"+":"")+K("00000"+Math.abs(t),0<=t&&t<=9999?-4:-6);for(var n=0;n<e.length;++n){e[n]=K("00"+e[n],-2)}return t+"-"+W(e,0,2).join("-")+"T"+W(e,2).join(":")+"."+K("000"+er(this),-3)+"Z"}},ur||lr);var cr=function(){try{return Date.prototype.toJSON&&new Date(NaN).toJSON()===null&&new Date(or).toJSON().indexOf(fr)!==-1&&Date.prototype.toJSON.call({toISOString:function(){return true}})}catch(t){return false}}();if(!cr){Date.prototype.toJSON=function toJSON(t){var r=e(this);var n=z.ToPrimitive(r);if(typeof n==="number"&&!isFinite(n)){return null}var i=r.toISOString;if(!D(i)){throw new TypeError("toISOString property is not callable")}return i.call(r)}}var vr=Date.parse("+033658-09-27T01:46:40.000Z")===1e15;var hr=!isNaN(Date.parse("2012-04-04T24:00:00.500Z"))||!isNaN(Date.parse("2012-11-31T23:59:59.000Z"))||!isNaN(Date.parse("2012-12-31T23:59:60.000Z"));var pr=isNaN(Date.parse("2000-01-01T00:00:00.000Z"));if(pr||hr||!vr){var yr=Math.pow(2,31)-1;var dr=Y(new Date(1970,0,1,0,0,0,yr+1).getTime());Date=function(t){var r=function Date(e,n,i,a,f,u,l){var s=arguments.length;var c;if(this instanceof t){var v=u;var h=l;if(dr&&s>=7&&l>yr){var p=Math.floor(l/yr)*yr;var y=Math.floor(p/1e3);v+=y;h-=y*1e3}c=s===1&&o(e)===e?new t(r.parse(e)):s>=7?new t(e,n,i,a,f,v,h):s>=6?new t(e,n,i,a,f,v):s>=5?new t(e,n,i,a,f):s>=4?new t(e,n,i,a):s>=3?new t(e,n,i):s>=2?new t(e,n):s>=1?new t(e instanceof t?+e:e):new t}else{c=t.apply(this,arguments)}if(!J(c)){P(c,{constructor:r},true)}return c};var e=new RegExp("^"+"(\\d{4}|[+-]\\d{6})"+"(?:-(\\d{2})"+"(?:-(\\d{2})"+"(?:"+"T(\\d{2})"+":(\\d{2})"+"(?:"+":(\\d{2})"+"(?:(\\.\\d{1,}))?"+")?"+"("+"Z|"+"(?:"+"([-+])"+"(\\d{2})"+":(\\d{2})"+")"+")?)?)?)?"+"$");var n=[0,31,59,90,120,151,181,212,243,273,304,334,365];var i=function dayFromMonth(t,r){var e=r>1?1:0;return n[r]+Math.floor((t-1969+e)/4)-Math.floor((t-1901+e)/100)+Math.floor((t-1601+e)/400)+365*(t-1970)};var a=function toUTC(r){var e=0;var n=r;if(dr&&n>yr){var i=Math.floor(n/yr)*yr;var a=Math.floor(i/1e3);e+=a;n-=a*1e3}return u(new t(1970,0,1,0,0,e,n))};for(var f in t){if(G(t,f)){r[f]=t[f]}}P(r,{now:t.now,UTC:t.UTC},true);r.prototype=t.prototype;P(r.prototype,{constructor:r},true);var l=function parse(r){var n=e.exec(r);if(n){var o=u(n[1]),f=u(n[2]||1)-1,l=u(n[3]||1)-1,s=u(n[4]||0),c=u(n[5]||0),v=u(n[6]||0),h=Math.floor(u(n[7]||0)*1e3),p=Boolean(n[4]&&!n[8]),y=n[9]==="-"?1:-1,d=u(n[10]||0),g=u(n[11]||0),w;var b=c>0||v>0||h>0;if(s<(b?24:25)&&c<60&&v<60&&h<1e3&&f>-1&&f<12&&d<24&&g<60&&l>-1&&l<i(o,f+1)-i(o,f)){w=((i(o,f)+l)*24+s+d*y)*60;w=((w+c+g*y)*60+v)*1e3+h;if(p){w=a(w)}if(-864e13<=w&&w<=864e13){return w}}return NaN}return t.parse.apply(this,arguments)};P(r,{parse:l});return r}(Date)}if(!Date.now){Date.now=function now(){return(new Date).getTime()}}var gr=l.toFixed&&(8e-5.toFixed(3)!=="0.000"||.9.toFixed(0)!=="1"||1.255.toFixed(2)!=="1.25"||(1000000000000000128).toFixed(0)!=="1000000000000000128");var wr={base:1e7,size:6,data:[0,0,0,0,0,0],multiply:function multiply(t,r){var e=-1;var n=r;while(++e<wr.size){n+=t*wr.data[e];wr.data[e]=n%wr.base;n=Math.floor(n/wr.base)}},divide:function divide(t){var r=wr.size;var e=0;while(--r>=0){e+=wr.data[r];wr.data[r]=Math.floor(e/t);e=e%t*wr.base}},numToString:function numToString(){var t=wr.size;var r="";while(--t>=0){if(r!==""||t===0||wr.data[t]!==0){var e=o(wr.data[t]);if(r===""){r=e}else{r+=K("0000000",0,7-e.length)+e}}}return r},pow:function pow(t,r,e){return r===0?e:r%2===1?pow(t,r-1,e*t):pow(t*t,r/2,e)},log:function log(t){var r=0;var e=t;while(e>=4096){r+=12;e/=4096}while(e>=2){r+=1;e/=2}return r}};var br=function toFixed(t){var r,e,n,i,a,f,l,s;r=u(t);r=Y(r)?0:Math.floor(r);if(r<0||r>20){throw new RangeError("Number.toFixed called with invalid number of decimals")}e=u(this);if(Y(e)){return"NaN"}if(e<=-1e21||e>=1e21){return o(e)}n="";if(e<0){n="-";e=-e}i="0";if(e>1e-21){a=wr.log(e*wr.pow(2,69,1))-69;f=a<0?e*wr.pow(2,-a,1):e/wr.pow(2,a,1);f*=4503599627370496;a=52-a;if(a>0){wr.multiply(0,f);l=r;while(l>=7){wr.multiply(1e7,0);l-=7}wr.multiply(wr.pow(10,l,1),0);l=a-1;while(l>=23){wr.divide(1<<23);l-=23}wr.divide(1<<l);wr.multiply(1,1);wr.divide(2);i=wr.numToString()}else{wr.multiply(0,f);wr.multiply(1<<-a,0);i=wr.numToString()+K("0.00000000000000000000",2,2+r)}}if(r>0){s=i.length;if(s<=r){i=n+K("0.0000000000000000000",0,r-s+2)+i}else{i=n+K(i,0,s-r)+"."+K(i,s-r)}}else{i=n+i}return i};P(l,{toFixed:br},gr);var Tr=function(){try{return 1..toPrecision(undefined)==="1"}catch(t){return true}}();var mr=l.toPrecision;P(l,{toPrecision:function toPrecision(t){return typeof t==="undefined"?mr.call(this):mr.call(this,t)}},Tr);if("ab".split(/(?:ab)*/).length!==2||".".split(/(.?)(.?)/).length!==4||"tesst".split(/(s)*/)[1]==="t"||"test".split(/(?:)/,-1).length!==4||"".split(/.?/).length||".".split(/()()/).length>1){(function(){var t=typeof/()??/.exec("")[1]==="undefined";var r=Math.pow(2,32)-1;f.split=function(e,n){var i=String(this);if(typeof e==="undefined"&&n===0){return[]}if(!M(e)){return Q(this,e,n)}var a=[];var o=(e.ignoreCase?"i":"")+(e.multiline?"m":"")+(e.unicode?"u":"")+(e.sticky?"y":""),f=0,u,l,s,c;var h=new RegExp(e.source,o+"g");if(!t){u=new RegExp("^"+h.source+"$(?!\\s)",o)}var p=typeof n==="undefined"?r:z.ToUint32(n);l=h.exec(i);while(l){s=l.index+l[0].length;if(s>f){_(a,K(i,f,l.index));if(!t&&l.length>1){l[0].replace(u,function(){for(var t=1;t<arguments.length-2;t++){if(typeof arguments[t]==="undefined"){l[t]=void 0}}})}if(l.length>1&&l.index<i.length){v.apply(a,W(l,1))}c=l[0].length;f=s;if(a.length>=p){break}}if(h.lastIndex===l.index){h.lastIndex++}l=h.exec(i)}if(f===i.length){if(c||!h.test("")){_(a,"")}}else{_(a,K(i,f))}return a.length>p?W(a,0,p):a}})()}else if("0".split(void 0,0).length){f.split=function split(t,r){if(typeof t==="undefined"&&r===0){return[]}return Q(this,t,r)}}var Dr=f.replace;var Sr=function(){var t=[];"x".replace(/x(.)?/g,function(r,e){_(t,e)});return t.length===1&&typeof t[0]==="undefined"}();if(!Sr){f.replace=function replace(t,r){var e=D(r);var n=M(t)&&/\)[*?]/.test(t.source);if(!e||!n){return Dr.call(this,t,r)}else{var i=function(e){var n=arguments.length;var i=t.lastIndex;t.lastIndex=0;var a=t.exec(e)||[];t.lastIndex=i;_(a,arguments[n-2],arguments[n-1]);return r.apply(this,a)};return Dr.call(this,t,i)}}}var xr=f.substr;var Or="".substr&&"0b".substr(-1)!=="b";P(f,{substr:function substr(t,r){var e=t;if(t<0){e=w(this.length+t,0)}return xr.call(this,e,r)}},Or);var Er="\t\n\x0B\f\r \xa0\u1680\u180e\u2000\u2001\u2002\u2003"+"\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028"+"\u2029\ufeff";var jr="\u200b";var Ir="["+Er+"]";var Mr=new RegExp("^"+Ir+Ir+"*");var Ur=new RegExp(Ir+Ir+"*$");var $r=f.trim&&(Er.trim()||!jr.trim());P(f,{trim:function trim(){if(typeof this==="undefined"||this===null){throw new TypeError("can't convert "+this+" to object")}return o(this).replace(Mr,"").replace(Ur,"")}},$r);var Fr=d.bind(String.prototype.trim);var Nr=f.lastIndexOf&&"abc\u3042\u3044".lastIndexOf("\u3042\u3044",2)!==-1;P(f,{lastIndexOf:function lastIndexOf(t){if(typeof this==="undefined"||this===null){throw new TypeError("can't convert "+this+" to object")}var r=o(this);var e=o(t);var n=arguments.length>1?u(arguments[1]):NaN;var i=Y(n)?Infinity:z.ToInteger(n);var a=b(w(i,0),r.length);var f=e.length;var l=a+f;while(l>0){l=w(0,l-f);var s=V(K(r,l,a+f),e);if(s!==-1){return l+s}}return-1}},Nr);var Cr=f.lastIndexOf;P(f,{lastIndexOf:function lastIndexOf(t){return Cr.apply(this,arguments)}},f.lastIndexOf.length!==1);if(parseInt(Er+"08")!==8||parseInt(Er+"0x16")!==22){parseInt=function(t){var r=/^[-+]?0[xX]/;return function parseInt(e,n){if(typeof e==="symbol"){""+e}var i=Fr(String(e));var a=u(n)||(r.test(i)?16:10);return t(i,a)}}(parseInt)}if(1/parseFloat("-0")!==-Infinity){parseFloat=function(t){return function parseFloat(r){var e=Fr(String(r));var n=t(e);return n===0&&K(e,0,1)==="-"?-0:n}}(parseFloat)}if(String(new RangeError("test"))!=="RangeError: test"){var kr=function toString(){if(typeof this==="undefined"||this===null){throw new TypeError("can't convert "+this+" to object")}var t=this.name;if(typeof t==="undefined"){t="Error"}else if(typeof t!=="string"){t=o(t)}var r=this.message;if(typeof r==="undefined"){r=""}else if(typeof r!=="string"){r=o(r)}if(!t){return r}if(!r){return t}return t+": "+r};Error.prototype.toString=kr}if(R){var Ar=function(t,r){if(tt(t,r)){var e=Object.getOwnPropertyDescriptor(t,r);if(e.configurable){e.enumerable=false;Object.defineProperty(t,r,e)}}};Ar(Error.prototype,"message");if(Error.prototype.message!==""){Error.prototype.message=""}Ar(Error.prototype,"name")}if(String(/a/gim)!=="/a/gim"){var Rr=function toString(){var t="/"+this.source+"/";if(this.global){t+="g"}if(this.ignoreCase){t+="i"}if(this.multiline){t+="m"}return t};RegExp.prototype.toString=Rr}});

/*!
 * https://github.com/martindrapeau/csvjson-csv2json
 * @license Copyright (c) 2019 Martin Drapeau, MIT License
 * see https://github.com/martindrapeau/csvjson-csv2json/blob/master/LICENSE
 */
(function(){function z(l){var g={},b;D.forEach(function(c,n){g[c]=(l.match(new RegExp(c,"g"))||[]).length;b=!b||g[c]>g[b]?c:b});return b}function E(){var l=[].slice.call(arguments);return l.reduce(function(g,b){return g.length>b.length?g:b},[]).map(function(g,b){return l.map(function(c){return c[b]})})}function F(l){for(var g={},b=0;b<l.length;b++){var c=l[b];void 0===g[c]?g[c]=0:g[c]++}var n=[];for(b=l.length-1;0<=b;b--)c=l[b],0<g[c]&&(c=c+"__"+g[c]--),n.unshift(c);return n}function v(l,g){g||(g={});if(0==l.length)throw"Empty CSV. Please provide something.";var b=g.separator||z(l);if(!b)throw"We could not detect the separator.";var c=[];try{c=G.parse(l,H[b])}catch(q){c=l.lastIndexOf("\n",q.offset);var n=l.indexOf("\n",q.offset);c=l.substring(-1<=c?c:0,-1<n?n:l.length);throw q.message+" On line "+q.line+" and column "+q.column+".\n"+c;}g.transpose&&(c=E.apply(this,c));b=c.shift();if(0==b.length)throw"Could not detect header. Ensure first row cotains your column headers.";b=b.map(function(b){return b.trim().replace(/(^")|("$)/g,"")});b=F(b);for(var A=g.hash?{}:[],t=0;t<c.length;t++){for(var u={},r=0;r<b.length;r++){var w=(c[t][r]||"").trim().replace(/(^")|("$)/g,""),v=""===w?NaN:w-0;if(g.hash&&0==r)n=w;else if(g.parseJSON||g.parseNumbers&&!isNaN(v))try{u[b[r]]=JSON.parse(w)}catch(q){u[b[r]]=w}else u[b[r]]=w}g.hash?A[n]=u:A.push(u)}return A}var D=[",",";","\t"],H={",":"comma",";":"semicolon","\t":"tab"},G=function(){function l(b){return'"'+b.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\x08/g,"\\b").replace(/\t/g,"\\t").replace(/\n/g,"\\n").replace(/\f/g,"\\f").replace(/\r/g,"\\r").replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g,escape)+'"'}var g={parse:function(b,c){function n(b){a<y||(a>y&&(y=a,B=[]),B.push(b))}function g(){var e,c,d;var h=c=a;var f=[];if(/^[\n\r]/.test(b.charAt(a))){var g=b.charAt(a);a++}else g=null,0===p&&n("[\\n\\r]");for(;null!==g;)f.push(g),/^[\n\r]/.test(b.charAt(a))?(g=b.charAt(a),a++):(g=null,0===p&&n("[\\n\\r]"));if(null!==f)if(g=t(),null!==g){var k=[];var l=d=a;if(/^[\n\r]/.test(b.charAt(a))){var m=b.charAt(a);a++}else m=null,0===p&&n("[\\n\\r]");if(null!==m)for(e=[];null!==m;)e.push(m),/^[\n\r]/.test(b.charAt(a))?(m=b.charAt(a),a++):(m=null,0===p&&n("[\\n\\r]"));else e=null;null!==e?(m=t(),null!==m?e=[e,m]:(e=null,a=l)):(e=null,a=l);null!==e&&(e=e[1]);for(null===e&&(a=d);null!==e;){k.push(e);l=d=a;/^[\n\r]/.test(b.charAt(a))?(m=b.charAt(a),a++):(m=null,0===p&&n("[\\n\\r]"));if(null!==m)for(e=[];null!==m;)e.push(m),/^[\n\r]/.test(b.charAt(a))?(m=b.charAt(a),a++):(m=null,0===p&&n("[\\n\\r]"));else e=null;null!==e?(m=t(),null!==m?e=[e,m]:(e=null,a=l)):(e=null,a=l);null!==e&&(e=e[1]);null===e&&(a=d)}if(null!==k){e=[];/^[\n\r]/.test(b.charAt(a))?(m=b.charAt(a),a++):(m=null,0===p&&n("[\\n\\r]"));for(;null!==m;)e.push(m),/^[\n\r]/.test(b.charAt(a))?(m=b.charAt(a),a++):(m=null,0===p&&n("[\\n\\r]"));null!==e?f=[f,g,k,e]:(f=null,a=h)}else f=null,a=h}else f=null,a=h;else f=null,a=h;null!==f&&(g=f[2],g.unshift(f[1]),f=g);null===f&&(a=c);return f}function t(){var e,g;var d=e=a;var h=u();if(null!==h){var f=[];var c=g=a;if(b.length>a){var k=b.charAt(a);a++}else k=null,0===p&&n("any character");if(null!==k){var l=k==x?"":null;if(null!==l){var m=u();null!==m?k=[k,l,m]:(k=null,a=c)}else k=null,a=c}else k=null,a=c;null!==k&&(k=k[2]);for(null===k&&(a=g);null!==k;)f.push(k),c=g=a,b.length>a?(k=b.charAt(a),a++):(k=null,0===p&&n("any character")),null!==k?(l=k==x?"":null,null!==l?(m=u(),null!==m?k=[k,l,m]:(k=null,a=c)):(k=null,a=c)):(k=null,a=c),null!==k&&(k=k[2]),null===k&&(a=g);null!==f?(k=h||f.length?"":null,null!==k?h=[h,f,k]:(h=null,a=d)):(h=null,a=d)}else h=null,a=d;null!==h&&(f=h[1],f.unshift(h[0]),h=f);null===h&&(a=e);return h}function u(){var e,c;var d=c=a;if(34===b.charCodeAt(a)){var h='"';a++}else h=null,0===p&&n('"\\""');if(null!==h){var f=[];for(e=r();null!==e;)f.push(e),e=r();null!==f?(34===b.charCodeAt(a)?(e='"',a++):(e=null,0===p&&n('"\\""')),null!==e?h=[h,f,e]:(h=null,a=d)):(h=null,a=d)}else h=null,a=d;null!==h&&(h=h[1].join(""));null===h&&(a=c);if(null===h){c=a;h=[];var g=d=a;/^[^\n\r]/.test(b.charAt(a))?(f=b.charAt(a),a++):(f=null,0===p&&n("[^\\n\\r]"));null!==f?(e=f!=x?"":null,null!==e?f=[f,e]:(f=null,a=g)):(f=null,a=g);null!==f&&(f=f[0]);for(null===f&&(a=d);null!==f;)h.push(f),g=d=a,/^[^\n\r]/.test(b.charAt(a))?(f=b.charAt(a),a++):(f=null,0===p&&n("[^\\n\\r]")),null!==f?(e=f!=x?"":null,null!==e?f=[f,e]:(f=null,a=g)):(f=null,a=g),null!==f&&(f=f[0]),null===f&&(a=d);null!==h&&(h=h.join(""));null===h&&(a=c)}return h}function r(){var e;var c=e=a;if(34===b.charCodeAt(a)){var d='"';a++}else d=null,0===p&&n('"\\""');if(null!==d){if(34===b.charCodeAt(a)){var h='"';a++}else h=null,0===p&&n('"\\""');null!==h?d=[d,h]:(d=null,a=c)}else d=null,a=c;null!==d&&(d='"');null===d&&(a=e);null===d&&(/^[^"]/.test(b.charAt(a))?(d=b.charAt(a),a++):(d=null,0===p&&n('[^"]')));return d}function w(a){a.sort();for(var b=null,d=[],e=0;e<a.length;e++)a[e]!==b&&(d.push(a[e]),b=a[e]);return d}function v(){for(var e=1,c=1,d=!1,h=0;h<Math.max(a,y);h++){var f=b.charAt(h);"\n"===f?(d||e++,c=1,d=!1):"\r"===f||"\u2028"===f||"\u2029"===f?(e++,c=1,d=!0):(c++,d=!1)}return{line:e,column:c}}var q={comma:function(){var b;var c=b=a;var d=(x=",","");if(null!==d){var h=g();null!==h?d=[d,h]:(d=null,a=c)}else d=null,a=c;null!==d&&(d=d[1]);null===d&&(a=b);return d},semicolon:function(){var b;var c=b=a;var d=(x=";","");if(null!==d){var h=g();null!==h?d=[d,h]:(d=null,a=c)}else d=null,a=c;null!==d&&(d=d[1]);null===d&&(a=b);return d},tab:function(){var b;var c=b=a;var d=(x="\t","");if(null!==d){var h=g();null!==h?d=[d,h]:(d=null,a=c)}else d=null,a=c;null!==d&&(d=d[1]);null===d&&(a=b);return d},sv:g,line:t,field:u,"char":r};if(void 0!==c){if(void 0===q[c])throw Error("Invalid rule name: "+l(c)+".");}else c="comma";var a=0,p=0,y=0,B=[],x=",";q=q[c]();if(null===q||a!==b.length){q=Math.max(a,y);var z=q<b.length?b.charAt(q):null,C=v();throw new this.SyntaxError(w(B),z,q,C.line,C.column);}return q},toSource:function(){return this._source},SyntaxError:function(b,c,g,v,t){this.name="SyntaxError";this.expected=b;this.found=c;switch(b.length){case 0:b="end of input";break;case 1:b=b[0];break;default:b=b.slice(0,b.length-1).join(", ")+" or "+b[b.length-1]};c=c?l(c):"end of input";this.message="Expected "+b+" but "+c+" found.";this.offset=g;this.line=v;this.column=t}};g.SyntaxError.prototype=Error.prototype;return g}();"undefined"!==typeof exports?("undefined"!==typeof module&&module.exports&&(exports=module.exports=v),exports.csv2json=v):(this.CSVJSON||(this.CSVJSON={}),this.CSVJSON.csv2json=v)}).call(this);

/* 設定 */

var colors = [
  "d60000", // 0
  "ff6600", // 1
  "24aa00", // 2
  "00916a", // 3
  "009da3", // 4
  "008ad9", // 5
  "0066d9", // 6
  "1400a8", // 7
  "6800d3", // 8
  "990099", // 9
  "cd00bc", // 10
  "ff009c" // 11
];

var artboardSize = 64;

var gutterSize = 36;

var fontAssets = {
  'sans-serif': [
    'HiraKakuProN-W6',
    'HiraKakuPro-W6',
    'NotoSansCJKjp-Bold',
    'SourceHanSansJP-Bold',
    'Meiryo-Bold'
  ],
  serif: [
    'MattisePro-B',
    'KozMinPro-Bold'
  ],
  pop: [
    'HGSoeiKakupoptai'
  ]
}

/* 処理 */

var parsedColors = colors.map(parseColor)

var docRef = app.documents.add(DocumentColorSpace.RGB);

var csvFile = File.openDialog("Choose decomoji CSV");
csvFile.open("r");
var rows = CSVJSON.csv2json(csvFile.read());

var columnCount = Math.min(rows.length, colors.length);

// アートボードを生成
rows.forEach(function(row, i) {
  var x = (i % columnCount) * (artboardSize + gutterSize);
  var y = Math.floor(i / columnCount) * (artboardSize + gutterSize) * -1;
  var artboard = docRef.artboards.add([
    x,
    y,
    x + artboardSize,
    y - artboardSize
  ]);
  artboard.name = row.yomi;
});

// デフォルトのアートボードは削除する
docRef.artboards.remove(0);

// 文字を入れていく
rows.forEach(function(row, i) {
  var calculated = calcDrawingText(row.content);

  var textRef = docRef.textFrames.add();
  textRef.orientation = calculated.orientation;
  textRef.contents = calculated.lines.join("\n");

  var charStyle = docRef.characterStyles.add(String(i));
  var attrs = charStyle.characterAttributes;

  attrs.fillColor = getColorByIndex(i);
  attrs.textFont = getTextFont(row.font);
  attrs.size =
    calculated.orientation === TextOrientation.HORIZONTAL
      ? artboardSize / calculated.lines.length
      : artboardSize / calculated.lines[0].length;
  attrs.autoLeading = false;
  attrs.leading = attrs.size;
  attrs.akiLeft = 0;
  attrs.akiRight = 0;

  // この時点のテキスト幅を図る必要があるため、いったんスタイルを適用する
  charStyle.applyTo(textRef.textRange, true);
  
  attrs.horizontalScale = Math.min(100, (artboardSize / textRef.width) * 100);
  charStyle.applyTo(textRef.textRange, true);

  textRef.left = docRef.artboards[i].artboardRect[0]
  textRef.top = docRef.artboards[i].artboardRect[1]
  
  // 縦書きの時に中央に寄せる
  if (textRef.width < artboardSize) {
    textRef.left += (artboardSize - textRef.width) / 2;
  }

  // 今後必要のないスタイル定義なので削除する
  charStyle.remove();
});

/**
 * Hex color の成分を分解する
 * @param hexColor
 * @returns {{red: number, green: number, blue: number}}
 */
function parseColor(hexColor) {
  return {
    red: parseInt(hexColor.slice(0, 2), 16),
    green: parseInt(hexColor.slice(2, 4), 16),
    blue: parseInt(hexColor.slice(4, 6), 16)
  }
}

/**
 * テキストを分解して書字方向を決定する
 * @param rawText
 * @returns {{orientation: number, lines: Array<string>}}
 */
function calcDrawingText(rawText) {
  var orientation = TextOrientation.HORIZONTAL;
  var lines = [rawText];
  // 半角スペースが含まれていれば強制的に改行
  if (rawText.indexOf(" ") >= 0) {
    lines = rawText.split(/ +/g);
  } else {
    var split = splitText(rawText);
    // ２文字かつASCII文字が含まれていなければ、縦書き
    if (split.length === 2 && !split.some(hasAsciiString)) {
      orientation = TextOrientation.VERTICAL;
    } else if (split.length > 2) {
      var slicePos = Math.ceil(split.length / 2);
      lines = [
        split.slice(0, slicePos).join(""),
        split.slice(slicePos).join("")
      ];
    }
  }
  return {
    orientation: orientation,
    lines: lines
  };
}

/**
 * テキストを分割する。ASCII文字の連続はひとまとまりと見なす。スペースは無視される。
 * 例:「ああhogeああ」→「あ,あ,hoge,あ,あ」
 * @param {String} text 分割するテキスト
 * @returns {Array<string>} 分割されたテキスト
 */
function splitText(text) {
  return text.split(/\s*/).reduce(function(prev, curr) {
    if (prev.length === 0) {
      prev.push(curr)
    } else {
      var lastChar = prev[prev.length - 1].slice(-1)
      if (hasNonAsciiString(lastChar) || hasNonAsciiString(curr)) {
        prev.push(curr)
      } else {
        prev[prev.length - 1] += curr
      }
    }
    return prev
  }, [])
}

/**
 * ASCII 文字を含むかどうか判定
 * @param string
 * @returns {boolean}
 */
function hasAsciiString(string) {
  return /[!-~]/.test(string)
}

/**
 * 非 ASCII 文字を含むかどうか判定
 * @param string
 * @returns {boolean}
 */
function hasNonAsciiString(string) {
  return /[^!-~]/.test(string)
}

/**
 * index から あるべき色を取得する
 * @param index
 * @returns {RGBColor}
 */
function getColorByIndex(index) {
  var colorIndex = index % columnCount;
  var color = parsedColors[colorIndex];
  var fillColor = new RGBColor();
  fillColor.red = color.red;
  fillColor.green = color.green;
  fillColor.blue = color.blue;
  return fillColor
}

/**
 * フォントの分類名から TextFont オブジェクトを取得する
 * @param fontName
 * @returns {TextFont}
 */
function getTextFont(fontName) {
  if (!fontName) {
    fontName = 'sans-serif'
  }
  if (fontName in fontAssets) {
    fontName = findAvailableFont(fontAssets[fontName])
  }
  return app.textFonts.getFontByName(fontName)
}

/**
 * 候補のなかから利用可能なフォントを探す
 * @param {Array<string>} targetFonts 候補フォント
 * @return {string} TextFonts.getFontByName に渡すフォント名
 */
function findAvailableFont(targetFonts) {
  for (var i = 0; i < targetFonts.length; i += 1) {
    if (app.textFonts.isFontAvailable(targetFonts[i])) {
      return targetFonts[i]
    }
  }
  // みつからなければ最初のフォントを返す。
  // 最終的に TextFonts.getFontByName メソッドを使うので、
  // 代替フォントの探索は Illustrator に任せるという意味。
  return targetFonts[0]
}
