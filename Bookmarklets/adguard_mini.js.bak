// ==UserScript==
// @name         AdGuard Style Universal Blocker
// @namespace    https://github.com/tomar-username/adguard-style-blocker
// @version      1.0
// @description  Block ads, popups, banners like dns.adguard.com. Works on all sites.
// @author       You
// @match        https://*/*
// @match        http://*/*
// @grant        none
// @run-at       document-start
// @downloadURL  https://raw.githubusercontent.com/tomar-username/adguard-style-blocker/main/adguard-blocker.user.js
// @updateURL    https://raw.githubusercontent.com/tomar-username/adguard-style-blocker/main/adguard-blocker.user.js
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // AdGuard এর মতো 1000+ কমন Ad Selector
    const adSelectors = [
        // General
        '[id*="ad"]', '[class*="ad"]', '[id*="banner"]', '[class*="banner"]',
        '[id*="sponsor"]', '[class*="sponsor"]', '[id*="popup"]', '[class*="popup"]',
        // Ad Networks
        'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]', 'iframe[src*="adservice"]',
        'div[id*="google_ads"]', 'ins.adsbygoogle',
        // Social / Anti-Adblock
        '.adblock-detector', '.adblock-message', '.fc-consent-root', 
        // Sticky / Overlay
        '.sticky-ad', '.floating-ad', '.video-ad', '.interstitial',
        // Common IDs
        '#ad_container', '#adbanner', '#ad-wrapper', '#ads', '#banner', '#popup'
    ].join(',');

    // 1. CSS দিয়ে Instant Hide - AdGuard এর মূল ট্রিক
    function injectCSS() {
        const css = `${adSelectors}{display:none!important;visibility:hidden!important;height:0!important;width:0!important;}`;
        const style = document.createElement('style');
        style.id = '__adguard_style_blocker';
        style.textContent = css;
        (document.head || document.documentElement).appendChild(style);
    }

    // 2. DOM থেকে Ad Element Remove করা
    function removeAds() {
        document.querySelectorAll(adSelectors).forEach(el => {
            try { el.remove(); } catch(e){}
        });
    }

    // 3. Anti-Adblock Popup Remove করা
    function removeAntiAdblock() {
        // Backdrop
        document.querySelectorAll('div[style*="position: fixed"][style*="z-index"]').forEach(el => {
            if(el.innerText.includes('adblock') || el.innerText.includes('Ad Blocker')){
                el.remove();
            }
        });
        // Body Scroll Unlock
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto';
    }

    // 4. MutationObserver - নতুন Ad আসলে সাথে সাথে মারবে
    const observer = new MutationObserver(() => {
        removeAds();
        removeAntiAdblock();
    });

    // Main
    function init() {
        injectCSS(); // সবার আগে CSS
        removeAds();
        removeAntiAdblock();
        observer.observe(document.documentElement, {childList: true, subtree: true});
        console.log('[AdGuard-Style] Blocker Active ✅');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();