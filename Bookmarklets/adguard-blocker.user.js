// ==UserScript==
// @name         AdGuard DNS Style Network Blocker
// @namespace    adguard-dns-clone
// @version      2.0
// @description  Block ad/tracker network requests + hide ad elements
// @author       You
// @match        https://*/*
// @match        http://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Expanded common ad/tracker domain list
    const blockDomains = [
        'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
        'adservice.google.com', 'googletagservices.com', 'googletagmanager.com',
        'analytics.google.com', 'google-analytics.com', 'facebook.com/tr',
        'connect.facebook.net', 'ads.youtube.com', 'pagead2.googlesyndication.com',
        'adnxs.com', 'scorecardresearch.com', 'outbrain.com', 'taboola.com',
        'criteo.com', 'moatads.com', 'amazon-adsystem.com', 'adroll.com',
        'bidswitch.net', 'rubiconproject.com', 'pubmatic.com', 'openx.net'
    ];

    function isBlocked(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            return blockDomains.some(d => url.includes(d));
        } catch (e) {
            return false;
        }
    }

    // 1. Hijack fetch
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        const url = args[0] instanceof Request ? args[0].url : args[0];
        if (isBlocked(url)) {
            console.log('[Blocked:fetch]', url);
            return Promise.reject(new TypeError('Failed to fetch (blocked)'));
        }
        return originalFetch.apply(this, args);
    };

    // 2. Hijack XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (isBlocked(url)) {
            console.log('[Blocked:xhr]', url);
            // Throwing here actually stops the request (redirecting to 0.0.0.0
            // still fires a network request and can be slow/leaky).
            throw new Error('Blocked by userscript');
        }
        return originalOpen.call(this, method, url, ...rest);
    };

    // 3. Hijack sendBeacon (used heavily by trackers)
    if (navigator.sendBeacon) {
        const originalBeacon = navigator.sendBeacon.bind(navigator);
        navigator.sendBeacon = function (url, data) {
            if (isBlocked(url)) {
                console.log('[Blocked:beacon]', url);
                return false;
            }
            return originalBeacon(url, data);
        };
    }

    // 4. Block ad <script> and <iframe> tags as they're inserted
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (node.nodeType !== 1) continue;
                const src = node.src || node.href;
                if (src && isBlocked(src)) {
                    console.log('[Blocked:dom]', src);
                    node.remove();
                }
            }
        }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // 5. CSS hiding — SAFE, specific selectors only (avoid generic [class*="ad"])
    const adSelectors = [
        'iframe[src*="doubleclick"]',
        'iframe[src*="googlesyndication"]',
        'ins.adsbygoogle',
        'div[id^="google_ads_iframe"]',
        'div[class*="ad-container"]',
        'div[class*="advertisement"]',
        '[data-ad-slot]',
        '.taboola-placeholder',
        '.outbrain-placeholder'
    ].join(',');

    const style = document.createElement('style');
    style.textContent = `${adSelectors} { display: none !important; }`;
    (document.head || document.documentElement).appendChild(style);

    console.log('[AdGuard-DNS-Clone v2] Network Blocker Active');
})();