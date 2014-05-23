/// <reference path="../../typings/jquery/jquery.d.ts" />

module Told.AutoResize {

    export class Resizer {
        public static adjustScale(targetWidth: number, targetHeight: number, originalFontSize: number) {
            var body = $("body");

            var w = window.innerWidth;
            var h = window.innerHeight;

            var wRatio = w / targetWidth;
            var hRatio = h / targetHeight;

            var ratio = Math.min(wRatio, hRatio);

            //var fSizeStr = getComputedStyle(body[0]).fontSize;
            //var fSize = parseInt(fSizeStr.substr(0, fSizeStr.length - 2));

            var fSize = originalFontSize;

            var newFSize = fSize * ratio;

            body[0].style.fontSize = newFSize.toFixed(0) + "px";
        }
    }

}