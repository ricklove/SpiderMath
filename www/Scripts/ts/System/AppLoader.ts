﻿
module Told.AppLoader {

    export function loadScripts(scriptList: string[], onLoaded?: () => void, onProgress?: (double) => void) {

        function loadScriptInner(url: string, onScriptLoad: () => void) {
            // Based on jQuery.getScript
            var head = document.getElementsByTagName("head")[0] || document.documentElement;
            var script = document.createElement("script");
            script.src = url;

            // Handle Script loading
            var done = false;

            // Attach handlers for all browsers
            script.onload = script.onreadystatechange = function () {
                if (!done && (!this.readyState ||
                    this.readyState === "loaded" || this.readyState === "complete")) {
                    done = true;

                    onScriptLoad();

                    // Handle memory leak in IE
                    script.onload = script.onreadystatechange = null;
                    if (head && script.parentNode) {
                        head.removeChild(script);
                    }
                }
            };

            // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
            // This arises when a base node is used (#2709 and #4378).
            head.insertBefore(script, head.firstChild);
        }

        var scriptsToLoad = [];
        var scriptCount = 0;
        var isLoading = false;

        var loadNextScript = function () {

            if (onProgress) {
                onProgress(1.0 - (scriptsToLoad.length / scriptCount));
            }

            if (scriptsToLoad.length > 0) {
                var nextScript = scriptsToLoad.shift();
                loadScriptInner(nextScript, loadNextScript);
            } else {
                isLoading = false;
                if (onProgress) {
                    onProgress(1);
                }
                onLoaded();
            }
        };

        function loadScript(url) {
            scriptsToLoad.push(url);
            scriptCount++;

            if (!isLoading) {
                isLoading = true;

                setTimeout(loadNextScript, 0);
            }
        }

        scriptList.map(function (s) { loadScript(s) });
    }

    export function loadScript(url: string, onLoaded?: () => void) {
        loadScripts([url], onLoaded);
    }

    export function loadCss(url: string) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }

    export function loadRequirements_Main(onLoaded?: () => void, onProgress?: (double) => void) {

        var useJQM = false;

        if (useJQM) {
            loadCss('Styles/css/External/themes/default/jquery.mobile-1.4.0.min.css');
        } else {
            loadCss('Styles/css/External/base.css');
            loadCss('Styles/css/External/skeleton.css');
            loadCss('Styles/css/External/layout.css');
            loadCss('Styles/css/Theme.css');
        }

        loadCss('Styles/css/App.css');

        var scriptList = [
            'Scripts/js/External/jquery.min.js',
            //'Scripts/js/External/jquery.mobile-1.4.0.min.js',
            'Scripts/js/External/knockout-3.0.0.min.js',

        //'Scripts/js/External/dust-core-0.3.0.min.js',
            'Scripts/js/External/dust-full-0.3.0.min.js',

        //'Scripts/js/External/linq.min.js',
        //'Scripts/js/External/jquery.linq.min.js',
            'Scripts/ts/Support/AccessUserSettings.js',
            'Scripts/ts/Support/AccessProviders.js',

            'Scripts/ts/User/TetrisGame.js',
            'Scripts/ts/User/000_MainViewModel.js',

        ];

        if (useJQM) {
            scriptList.shift();
            scriptList.unshift('Scripts/js/External/jquery.mobile-1.4.0.min.js');
            scriptList.unshift('Scripts/js/External/jquery.min.js');
        }

        loadScripts(scriptList, onLoaded, onProgress);

    }

    export function loadRequirements_Testing(onLoaded?: () => void, onProgress?: (double) => void) {

        loadCss('Styles/css/External/qunit-1.14.0.css');

        var scriptList = [
            'Scripts/js/External/qunit-1.14.0.min.js',
            'Scripts/ts/System/FeatureTests.js',
        ];

        loadScripts(scriptList, onLoaded, onProgress);

    }

    export function loadRequirements_UnitTests(onLoaded?: () => void, onProgress?: (double) => void) {

        var scriptList = [
            //'Scripts/ts/User/001_DisplayWord_Tests.js',
            //'Scripts/ts/Support/ParsePassageText_Tests.js',
            //'Scripts/ts/User/001_DisplayPassage_Tests.js',
            //'Scripts/ts/User/002_ChangePassage_Tests.js',
            //'Scripts/ts/User/003_DisplayEntryColorCoding_Tests.js',
        ];

        loadScripts(scriptList, onLoaded, onProgress);
    }



}