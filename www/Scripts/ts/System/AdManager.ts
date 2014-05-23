/// <reference path="../../typings/jquery/jquery.d.ts" />

declare var CocoonJS;

// Mellenial Web Ads 
// http://docs.millennialmedia.com/mmadlib/JavascriptInterstitialAds.html
declare var mmAPI;

module Told.Ads {

    var mmAPI_ID = "163527";

    class AdManager {

        minBetweenAds: number;
        timeLastDisplayed: number = null;

        constructor(minBetweenAds: number = 30) {
            this.minBetweenAds = minBetweenAds;
        }

        public preloadAds() {
            CocoonJS.Ad.preloadFullScreen();
        }

        public cacheNextAd() {
            if (!this._cocoonAdIsReady) {
                CocoonJS.Ad.refreshFullScreen();
            }
        }

        public showFullScreenAdIfReady(onFinished: () => void) {
            if (Date.now() > this.timeLastDisplayed + (this.minBetweenAds * 60 * 1000)) {

                if (this._cocoonAdIsReady) {
                    this._onFinishedCallback = onFinished;
                    CocoonJS.Ad.showFullScreen();

                } else if (mmAPI != null) {
                    mmAPI.placeAd({
                        containerElementId: "adContainer",
                        apid: mmAPI_ID,
                        placementType: "interstitial",
                        allowLocation: false
                    }, function (wasOK) {
                            if (wasOK) {
                                this.timeLastDisplayed = Date.now();
                            }

                            onFinished();
                        });
                } else {
                    // TODO: Show a self in-app-purchase ad
                    // Or promote other apps
                    onFinished();
                }

            } else {
                onFinished();
            }
        }

        // CocoonJS interface
        _cocoonAdIsReady = false;
        _onFinishedCallback: () => void;

        private setupCocoon() {
            CocoonJS.Ad.onFullScreenShown.addEventListener(function () {
                this._cocoonAdIsReady = false;
                this.timeLastDisplayed = Date.now();

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
        }
    }

    var instance: AdManager = null;

    export function init(minBetweenAds: number = 30) {

        if (instance === null) {
            instance = new AdManager(minBetweenAds);
            instance.preloadAds();
        } else {
            instance.minBetweenAds = minBetweenAds;
        }
    }

    export function show(onFinished: () => void) {
        if (instance === null) {
            Init();
        }

        instance.showFullScreenAdIfReady(onFinished);
    }

}