var Told;
(function (Told) {
    (function (Analytics) {
        // Manually call google analytics
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/
        // https://developers.google.com/analytics/devguides/collection/protocol/v1/devguide
        //POST / collect HTTP / 1.1
        //Host: www.google - analytics.com
        //payload_data
        //v=1             // Version.
        //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
        //&cid=555        // Anonymous Client ID.
        //&t=             // Hit Type.
        //    Example:
        //v=1&tid=UA-XXXX-Y&cid=555&t=pageview&dp=%2Fhome
        //    Page Tracking
        //v=1             // Version.
        //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
        //&cid=555        // Anonymous Client ID.
        //&t=pageview     // Pageview hit type.
        //&dh=mydemo.com  // Document hostname.
        //&dp=/home       // Page.
        //&dt=homepage    // Title.
        //Event Tracking
        //v=1             // Version.
        //&tid=UA-XXXX-Y  // Tracking ID / Web property / Property ID.
        //&cid=555        // Anonymous Client ID.
        //&t=event        // Event hit type
        //&ec=video       // Event Category. Required.
        //&ea=play        // Event Action. Required.
        //&el=holiday     // Event label.
        //&ev=300         // Event value.
        var GoogleAnalyticsMeasurementProtocol = (function () {
            function GoogleAnalyticsMeasurementProtocol() {
            }
            GoogleAnalyticsMeasurementProtocol.trackEvent = function (category, action, label, value) {
                if (typeof label === "undefined") { label = ""; }
                if (typeof value === "undefined") { value = ""; }
                // Universal Analytics method (which does not work in installed apps)
                //// Send to google analytics
                //if (sendToAnalytics && window["ga"]) {
                //    ga('send', 'event', category, message);
                //}
                // Measurement Protocol direct call
            };
            return GoogleAnalyticsMeasurementProtocol;
        })();
        Analytics.GoogleAnalyticsMeasurementProtocol = GoogleAnalyticsMeasurementProtocol;
    })(Told.Analytics || (Told.Analytics = {}));
    var Analytics = Told.Analytics;
})(Told || (Told = {}));
