/*! (C) Copyright 2020 LanguageTooler GmbH. All rights reserved. */
class Tracker {
    static _constructor() {
        if (Tracker._isInitialized) return;
        const e = EnvironmentAdapter.getURL("/");
        window.addEventListener("error", (r) => {
            const t = r.message,
                a = r.filename,
                n = r.lineno,
                o = r.error;
            if (!a || !a.startsWith(e)) return;
            if ("string" != typeof t) return;
            if (t.includes("ResizeObserver")) return;
            const i = o && generateStackTrace(o);
            i ? Tracker.trackError("js", t, i) : Tracker.trackError("js", t, `${a}:${n}`);
        }),
            (Tracker._isInitialized = !0);
    }
    static _getCustomVariables() {
        const e = Tracker._storageController.getSettings(),
            r = Tracker._storageController.getUIState();
        Tracker._storageController.getTestFlags();
        return { 1: ["version", String(this.VERSION)], 2: ["autoCheck", String(e.autoCheck)], 3: ["account", String(e.havePremiumAccount)], 4: ["subscription", String(r.hasPaidSubscription)] };
    }
    static _getTrackingUrlForPageView(e) {
        return (
            (e = e.replace(/^(chrome|moz|safari|edge)-extension:\/\/.+?\//i, "")),
            (e = `${Tracker.TRACKING_BASE_PAGE_URL}${e}`),
            new Promise((r, t) => {
                Tracker._storageController.onReady(() => {
                    const { firstVisit: t, sessionCount: a } = Tracker._storageController.getStatistics(),
                        n = Tracker._storageController.getUniqueId(),
                        o = { idsite: Tracker.TRACKING_SITE_ID, _cvar: JSON.stringify(Tracker._getCustomVariables()), rec: "1", url: e, rand: Date.now(), apiv: "1", res: `${screen.width}x${screen.height}`, _id: n, _idts: t, _idvc: a };
                    let i = "";
                    for (const e in o) o.hasOwnProperty(e) && (i += `${e}=${encodeURIComponent(o[e])}&`);
                    r(`${Tracker.TRACKING_BASE_URL}?${i}`);
                });
            })
        );
    }
    static _getTrackingUrlForEvent(e, r, t = "", a) {
        return (
            (a = a || Tracker.TRACKING_BASE_PAGE_URL),
            new Promise((n, o) => {
                Tracker._storageController.onReady(() => {
                    const { firstVisit: o, sessionCount: i } = Tracker._storageController.getStatistics(),
                        s = Tracker._storageController.getUniqueId(),
                        c = {
                            idsite: Tracker.TRACKING_SITE_ID,
                            _cvar: JSON.stringify(this._getCustomVariables()),
                            rec: "1",
                            url: a,
                            action_name: r,
                            rand: Date.now(),
                            apiv: "1",
                            res: `${screen.width}x${screen.height}`,
                            _id: s,
                            _idts: o,
                            _idvc: i,
                            e_c: e,
                            e_a: r,
                            e_n: t,
                        };
                    let g = "";
                    for (const e in c) c.hasOwnProperty(e) && (g += `${e}=${encodeURIComponent(c[e])}&`);
                    n(`${Tracker.TRACKING_BASE_URL}?${g}`);
                });
            })
        );
    }
    static _sendRequest(e) {
        if ("1" !== navigator.doNotTrack) {
            const r = new Image();
            (r.referrerPolicy = "no-referrer"), (r.src = e);
        }
    }
    static trackPageView(e) {
        (e = e || getCurrentUrl()),
            Tracker._getTrackingUrlForPageView(e)
                .then((r) => {
                    EnvironmentAdapter.isProductionEnvironment() ? Tracker._sendRequest(r) : console.log("LT Page view tracking disabled in dev mode", { pageUrl: e, trackingUrl: r });
                })
                .catch((e) => {
                    console.log("LT could not track because:", e && e.message);
                });
    }
    static trackDisabledRule(e, r, t, a) {
        if (!e.match(/^de|en|nl|es|fr/i)) return;
        const n = a ? config.PACKAGE.PREMIUM : config.PACKAGE.BASIC,
            o = e + ":" + r,
            i = t;
        let s = Tracker.TRACKING_BASE_URL;
        (s += `?idsite=18&rec=1&url=${encodeURIComponent(Tracker.TRACKING_BASE_PAGE_URL)}`),
            (s += `&action_name=${n}&rand=${Date.now()}&apiv=1&_id=${this._storageController.getUniqueId()}`),
            (s += `&e_c=${n}&e_a=${encodeURIComponent(o)}&e_n=${encodeURIComponent(t)}`),
            EnvironmentAdapter.isProductionEnvironment() ? this._sendRequest(s) : console.log("LT Event tracking disabled in dev mode", { actionCategory: n, action: o, actionName: i, trackingUrl: s });
    }
    static trackDictionaryEvent(e, r, t = !1) {
        if (!e.match(/^de|en|nl|es|fr|it|pt|ru|ca|pl/i)) return;
        const a = t ? "TemporaryIgnored" : "PersistentlyIgnored",
            n = `${e}:add_word`,
            o = r;
        let i = Tracker.TRACKING_BASE_URL;
        (i += `?idsite=19&rec=1&url=${encodeURIComponent(Tracker.TRACKING_BASE_PAGE_URL)}`),
            (i += `&action_name=${a}&rand=${Date.now()}&apiv=1&_id=${this._storageController.getUniqueId()}`),
            (i += `&e_c=${a}&e_a=${encodeURIComponent(n)}&e_n=${encodeURIComponent(r)}`),
            EnvironmentAdapter.isProductionEnvironment() ? this._sendRequest(i) : console.log("LT Event tracking disabled in dev mode", { actionCategory: a, action: n, actionName: o, trackingUrl: i });
    }
    static trackEvent(e, r, t, a) {
        this._getTrackingUrlForEvent(e, r, t, a)
            .then((a) => {
                EnvironmentAdapter.isProductionEnvironment() ? this._sendRequest(a) : console.log("LT Event tracking disabled in dev mode", { actionCategory: e, action: r, actionName: t, trackingUrl: a });
            })
            .catch((e) => {
                console.log("LT could not track because:", e && e.message);
            });
    }
    static trackInstall() {
        Tracker.trackEvent("Action", "install", LanguageManager.getPrimaryLanguageCode(navigator.language)), this._storageController.updateUIState({ isNewUser: !0 });
    }
    static trackActivity() {
        const e = Date.now(),
            { sessionCount: r, firstVisit: t, lastActivity: a } = this._storageController.getStatistics(),
            { isNewUser: n } = this._storageController.getUIState();
        if (
            ((!a || e - a > Tracker.ACTIVITY_TRACK_INTERVAL) &&
                (this._storageController.updateStatistics({ sessionCount: r + 1, lastActivity: e }), this.trackEvent("Action", "ping", LanguageManager.getPrimaryLanguageCode(navigator.language))),
            n && t)
        ) {
            const r = 6048e5,
                a = e - 1e3 * t;
            a > r &&
                a < 8 * r &&
                this._storageController
                    .updateUIState({ isNewUser: !1 })
                    .then(() => {
                        this.trackEvent("Action", "active_after_one_week", LanguageManager.getPrimaryLanguageCode(navigator.language));
                    })
                    .catch((e) => {
                        const r = String(e && e.message ? e.message : e);
                        this.trackEvent("JS-Error", `activity error: ${r}`);
                    });
        }
    }
    static trackError(e, r, t = "") {
        try {
            if (BrowserDetector.isUnsupportedBrowser()) return;
            if ((Tracker._errorCount++, Tracker._errorCount > config.MAX_EXCEPTION_COUNT)) return;
            if ("string" != typeof r) return;
            if (Tracker._loggedErrors)
                if (Tracker._loggedErrors.length < Tracker.THROTTLE_REQUESTS) Tracker._loggedErrors.push(Date.now());
                else {
                    const e = Date.now();
                    if (!(e - Tracker._loggedErrors[0] >= Tracker.MAX_TIME)) return;
                    Tracker._loggedErrors.push(e), Tracker._loggedErrors.splice(0, 1);
                }
            else Tracker._loggedErrors = [Date.now()];
            let a = "JS-Error";
            "message" === e ? (a = "Message-Error") : "http" === e ? (a = "HTTP-Error") : "other" === e && (a = "Other-Error");
            let n = getCurrentUrl();
            (n = n.replace(/^moz-extension:\/\/[a-z0-9\-]+\//, "moz-extension://xxxx-xxxx-xxxx-xxxx/")), this.trackEvent(a, r, t || n, n);
        } catch (e) {
            console.error("Error while logging error from language tool", e);
        }
    }
    static trackStat(e, r) {
        0 === Math.floor(10 * Math.random()) && Tracker.trackEvent("Stat", e, r);
    }
    static trackTextLength(e) {
        if (0 === e) return;
        let r = "";
        (r =
            e <= 100
                ? "1-100"
                : e <= 1e3
                ? "101-1000"
                : e <= 2500
                ? "1001-2500"
                : e <= 5e3
                ? "2501-5000"
                : e <= 7500
                ? "5001-7500"
                : e <= 1e4
                ? "7501-10000"
                : e <= 15e3
                ? "10001-15000"
                : e <= 2e4
                ? "15001-20000"
                : e <= 4e4
                ? "20001-40000"
                : e <= 6e4
                ? "40001-60000"
                : ">60000"),
            this.trackStat("text_length", r);
    }
}
(Tracker.TRACKING_BASE_URL = "https://analytics.languagetoolplus.com/matomo/piwik.php"),
    (Tracker.TRACKING_BASE_PAGE_URL = "https://fake/"),
    (Tracker.TRACKING_SITE_ID = EnvironmentAdapter.getTrackingId()),
    (Tracker.ACTIVITY_TRACK_INTERVAL = 864e5),
    (Tracker.MAX_TIME = 6e4),
    (Tracker.THROTTLE_REQUESTS = 10),
    (Tracker.VERSION = EnvironmentAdapter.getVersion()),
    (Tracker._storageController = StorageController.create()),
    (Tracker._isInitialized = !1),
    (Tracker._loggedErrors = null),
    (Tracker._errorCount = 0),
    Tracker._constructor();
