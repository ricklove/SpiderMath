/// <reference path="Debug.ts" />

var Told;
(function (Told) {
    (function (Ads) {
        var AdManager = (function () {
            function AdManager(minBetweenAds) {
                if (typeof minBetweenAds === "undefined") { minBetweenAds = 30; }
                this.timeLastDisplayed = null;
                // CocoonJS interface
                this._cocoonExistsAndAdIsReady = false;
                this.minBetweenAds = minBetweenAds;
            }
            AdManager.prototype.preloadAds = function () {
                if (window["CocoonJS"]) {
                    CocoonJS.Ad.preloadFullScreen();
                }
            };

            AdManager.prototype.cacheNextAd = function () {
                if (!this._cocoonExistsAndAdIsReady) {
                    CocoonJS.Ad.refreshFullScreen();
                }
            };

            AdManager.prototype.showFullScreenAdIfReady = function (onFinished) {
                var self = this;

                Told.log("ShowAd: Called");

                var onFinishedWrapper = function (wasOK) {
                    if (timeoutID_onFinishedForce === null) {
                        return;
                    }

                    clearTimeout(timeoutID_onFinishedForce);
                    timeoutID_onFinishedForce = null;

                    Told.log("ShowAd: onFinished wasOK=" + wasOK);

                    if (wasOK !== false) {
                        self.timeLastDisplayed = Date.now();
                    }

                    onFinished();
                };

                var timeoutID_onFinishedForce = setTimeout(onFinishedWrapper, 5000);

                if (Date.now() > self.timeLastDisplayed + (self.minBetweenAds * 60 * 1000)) {
                    Told.log("ShowAd: Ready");

                    if (self._cocoonExistsAndAdIsReady) {
                        self._onFinishedCallback = onFinishedWrapper;
                        CocoonJS.Ad.showFullScreen();

                        Told.log("ShowAd: Waiting for " + "'CocoonJS'" + " Ad");
                    } else {
                        // TODO: Show a self in-app-purchase ad
                        // Or promote other apps
                        onFinishedWrapper(false);
                    }
                } else {
                    Told.log("ShowAd: Not Ready");
                    onFinishedWrapper(false);
                }
            };

            AdManager.prototype.setupCocoon = function () {
                if (!window["CocoonJS"]) {
                    return;
                }

                CocoonJS.Ad.onFullScreenShown.addEventListener(function () {
                    this._cocoonAdIsReady = false;
                    Told.log("onFullScreenShown");
                });
                CocoonJS.Ad.onFullScreenHidden.addEventListener(function () {
                    Told.log("onFullScreenHidden");
                    this._onFinishedCallback(true);
                    this._onFinishedCallback = null;
                    this.cacheNextAd();
                });
                CocoonJS.Ad.onFullScreenReady.addEventListener(function () {
                    Told.log("onFullScreenReady");
                    this._cocoonAdIsReady = true;
                });
            };
            return AdManager;
        })();

        var instance = null;

        function init(minBetweenAds) {
            if (typeof minBetweenAds === "undefined") { minBetweenAds = 30; }
            if (instance === null) {
                instance = new AdManager(minBetweenAds);
                instance.preloadAds();
            } else {
                instance.minBetweenAds = minBetweenAds;
            }
        }
        Ads.init = init;

        function show(onFinished) {
            if (instance === null) {
                init();
            }

            instance.showFullScreenAdIfReady(onFinished);
        }
        Ads.show = show;
    })(Told.Ads || (Told.Ads = {}));
    var Ads = Told.Ads;
})(Told || (Told = {}));
