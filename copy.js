// ==UserScript==
// @name         Copy Text Enabler
// @namespace    https://github.com/tomar-username/copy-text-enabler
// @version      0.2
// @description  Enable text selection, copy and right click on any website
// @author       You
// @match        https://*/*
// @grant        none
// @run-at       document-end
// @downloadURL  https://raw.githubusercontent.com/tomar-username/copy-text-enabler/main/copy-text-enabler.user.js
// @updateURL    https://raw.githubusercontent.com/tomar-username/copy-text-enabler/main/copy-text-enabler.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    setTimeout(function(){
        try{
            // 1. CSS Inject করে select allow
            var styleId='__allow_text_select_style';
            if(!document.getElementById(styleId)){
                var s=document.createElement('style');
                s.id=styleId;
                s.textContent='*{user-select:text!important;-webkit-user-select:text!important;-moz-user-select:text!important;-ms-user-select:text!important;} *{touch-action:auto!important;} img,svg,canvas{pointer-events:auto!important;}';
                (document.head||document.documentElement).appendChild(s);
            }
            
            // 2. Event Block সরানো
            ['copy','cut','contextmenu','selectstart','mousedown','mouseup','pointerdown','pointerup'].forEach(function(ev){
                window.addEventListener(ev,function(e){try{e.stopImmediatePropagation();}catch(_){}} ,true);
                document.addEventListener(ev,function(e){try{e.stopImmediatePropagation();}catch(_){}} ,true);
            });

            // 3. Attribute সরানো
            document.querySelectorAll('*').forEach(function(el){
                try{
                    el.removeAttribute('oncopy');
                    el.removeAttribute('oncontextmenu');
                    el.removeAttribute('onselectstart');
                    el.style.userSelect='text';
                }catch(_){}
            });

            // 4. Document Handler Null
            document.oncopy=null;
            document.oncontextmenu=null;
            document.onselectstart=null;
            window.oncopy=null;
            window.oncontextmenu=null;

            // 5. Iframe এর ভিতরেও
            document.querySelectorAll('iframe').forEach(function(ifr){
                try{
                    var idoc=ifr.contentDocument|| (ifr.contentWindow&&ifr.contentWindow.document);
                    if(idoc){
                        var s2=idoc.createElement('style');
                        s2.textContent='*{user-select:text!important;}';
                        (idoc.head||idoc.documentElement).appendChild(s2);
                        idoc.oncopy=null;idoc.oncontextmenu=null;idoc.onselectstart=null;
                    }
                }catch(_){}
            });
            
            console.log('Selection & copy tools enabled ✅');
        }catch(err){
            console.error('Failed to enable: '+err);
        }
    },2000);
})();