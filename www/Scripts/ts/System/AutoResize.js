var Told;
(function (Told) {
    (function (AutoResize) {
        var Resizer = (function () {
            function Resizer() {
            }
            Resizer.adjustScale = function (targetWidth, targetHeight, originalFontSize) {
                var w = window.innerWidth;
                var h = window.innerHeight;

                var wRatio = w / targetWidth;
                var hRatio = h / targetHeight;

                var ratio = Math.min(wRatio, hRatio);

                //var fSizeStr = getComputedStyle(body[0]).fontSize;
                //var fSize = parseInt(fSizeStr.substr(0, fSizeStr.length - 2));
                var fSize = originalFontSize;

                var newFSize = fSize * ratio;

                var body = document.getElementsByTagName("body");
                body[0].style.fontSize = newFSize.toFixed(0) + "px";
            };
            return Resizer;
        })();
        AutoResize.Resizer = Resizer;
    })(Told.AutoResize || (Told.AutoResize = {}));
    var AutoResize = Told.AutoResize;
})(Told || (Told = {}));
