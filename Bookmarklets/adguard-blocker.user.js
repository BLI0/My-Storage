// ==UserScript==
// @name         AdGuard DNS Style Network Blocker (v3)
// @namespace    adguard-dns-clone
// @version      3.0
// @description  Block ad/tracker network requests (mobile SDK + web ad networks) + hide ad elements
// @author       You
// @match        https://*/*
// @match        http://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // ---- Exact / substring domain matches -------------------------------
    // Safe because these are specific ad/tracker/analytics hostnames.
    const blockDomains = [
        // Core ad networks
        'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
        'adservice.google.com', 'googletagservices.com', 'google.com/dfp',
        'amazon-adsystem.com', 'ads.mopub.com', 'mopub.com',

        // Mobile ad SDKs / networks
        'admob.com', 'greystripe.com', 'inmobi.com', 'inmobicdn.net',
        'admax.nexage.com', 'my.mobfox.com', 'madnet.ru', 'mydas.mobi',
        'millennialmedia.com', 'appsdt.com', 'admost.com', 'appnext.com',
        'appnext.hs', 'flurry.com', 'unityads.unity3d.com', 'adcolony.com',
        'adsafeprotected.com', 'applovin.com', 'applvn.com', 'chartboost.com',
        'vungle.com', 'pubnative.net', 'supersonicads.com',
        'startappservice.com', 'kaffnet.com', 'batmobil.net', 'eqmob.com',
        'rayjump.com', 'appodeal.com', 'duapps.com', 'smaato.com',
        'tapjoyads.com', 'tapjoy.com', 'wattpad.com/ad',

        // Analytics / tracking tied specifically to ad measurement
        'analytics.localytics.com', 'scorecardresearch.com',
        'appsflyer.com', 'plus1.wapstart.ru',

        // Yandex ad-specific (NOT bare yandex.com/yandex.net — see notes)
        'yandexadexchange.net', 'ad-mail.ru',

        // Facebook tracking pixel (path-specific, not all of facebook.com)
        'facebook.com/tr', 'graph.facebook.com/.*?/picture', // picture calls sometimes abused; adjust if it breaks avatars

        // Misc from list
        'moatads.com',
    ];

    // ---- Pattern-based rules (regex) ------------------------------------
    // These replace the overly-generic bare fragments like ".ad.", "/ad.",
    // "advert" from the raw list, so they only catch real ad-path shapes
    // instead of matching "admin", "download", "broadcast", etc.
    const blockPatterns = [
        /\/ads\//i,                    // "/ads/" as a path segment
        /[./-]ads?[./-]/i,             // ".ads." "-ads." ".ad." "/ad." as a delimited segment
        /\badvertis(e|ing|ement)\b/i,  // "advertise", "advertising", "advertisement" as whole words only
        /\bad_?serv(e|er|ing)\b/i,     // ad-serving patterns
    ];

    function isBlocked(url) {
        if (!url || typeof url !== 'string') return false;
        try {
            if (blockDomains.some(d => url.includes(d))) return true;
            if (blockPatterns.some(p => p.test(url))) return true;
            return false;
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
            throw new Error('Blocked by userscript');
        }
        return originalOpen.call(this, method, url, ...rest);
    };

    // 3. Hijack sendBeacon (heavily used by trackers)
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

    // 4. Block ad <script>/<iframe>/<img> tags as they're inserted into DOM
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

    // 5. CSS hiding — kept narrow and specific to avoid hiding real content.
    // Deliberately NOT using generic [class*="ad"] / [id*="ad"] — those
    // catch unrelated words like "header", "load", "gradient", "admin".
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

    console.log('[AdGuard-DNS-Clone v3] Network Blocker Active');
})();
