/// <reference path="Debug.ts" />

declare var CocoonJS;

module Told.Ads {

    class AdManager {

        minBetweenAds: number;
        timeLastDisplayed: number = null;

        constructor(minBetweenAds: number = 30) {
            this.minBetweenAds = minBetweenAds;
        }

        public preloadAds() {
            if (window["CocoonJS"]) {
                CocoonJS.Ad.preloadFullScreen();
            }
        }

        public cacheNextAd() {
            if (!this._cocoonExistsAndAdIsReady) {
                CocoonJS.Ad.refreshFullScreen();
            }
        }

        public showFullScreenAdIfReady(onFinished: () => void) {

            var self = this;

            Told.log("ShowAd: Called");

            var onFinishedWrapper = (wasOK) => {

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
        }

        // CocoonJS interface
        _cocoonExistsAndAdIsReady = false;
        _onFinishedCallback: (wasOK: boolean) => void;

        private setupCocoon() {
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
            init();
        }

        instance.showFullScreenAdIfReady(onFinished);
    }

}