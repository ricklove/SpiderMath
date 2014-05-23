/// <reference path="../../typings/jquery/jquery.d.ts" />


var Told;
(function (Told) {
    (function (Ads) {
        var mmAPI_ID = "163527";

        var AdManager = (function () {
            function AdManager(minBetweenAds) {
                if (typeof minBetweenAds === "undefined") { minBetweenAds = 30; }
                this.timeLastDisplayed = null;
                // CocoonJS interface
                this._cocoonAdIsReady = false;
                this.minBetweenAds = minBetweenAds;
            }
            AdManager.prototype.preloadAds = function () {
                CocoonJS.Ad.preloadFullScreen();
            };

            AdManager.prototype.cacheNextAd = function () {
                if (!this._cocoonAdIsReady) {
                    CocoonJS.Ad.refreshFullScreen();
                }
            };

            AdManager.prototype.showFullScreenAdIfReady = function (onFinished) {
                if (Date.now() > this.timeLastDisplayed + this.minBetweenAds) {
                    if (this._cocoonAdIsReady) {
                        this._onFinishedCallback = onFinished;
                        CocoonJS.Ad.showFullScreen();
                    } else if (mmAPI != null) {
                        mmAPI.placeAd({
                            containerElementId: "adContainer",
                            apid: mmAPI_ID,
                            placementType: "interstitial",
                            allowLocation: false
                        }, onFinished);
                    } else {
                        // TODO: Show a self in-app-purchase ad
                        // Or promote other apps
                        onFinished();
                    }
                } else {
                    onFinished();
                }
            };

            AdManager.prototype.setupCocoon = function () {
                CocoonJS.Ad.onFullScreenShown.addEventListener(function () {
                    this._cocoonAdIsReady = false;
                    console.log("onFullScreenShown");
                });
                CocoonJS.Ad.onFullScreenHidden.addEventListener(function () {
                    console.log("onFullScreenHidden");
                    this._onFinishedCallback();
                    this._onFinishedCallback = null;
                    this.cacheNextAd();
                });
                CocoonJS.Ad.onFullScreenReady.addEventListener(function () {
                    console.log("onFullScreenReady");
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
                Init();
            }

            instance.showFullScreenAdIfReady(onFinished);
        }
        Ads.show = show;
    })(Told.Ads || (Told.Ads = {}));
    var Ads = Told.Ads;
})(Told || (Told = {}));
