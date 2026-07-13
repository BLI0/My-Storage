// ==UserScript==
// @name         Eruda Console
// @namespace    https://viayoo.com/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @run-at       document-end
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    
    javascript:(function () {
  var script = document.createElement('script');
  script.src="https://cdn.jsdelivr.net/npm/eruda";
  document.body.append(script); script.onload = function () { eruda.init(); } })();



})();