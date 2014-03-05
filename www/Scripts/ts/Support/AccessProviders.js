/// <reference path="AccessUserSettings.ts" />
var Told;
(function (Told) {
    (function (SpellWell) {
        (function (Data) {
            function createDefaultProviders() {
                return {
                    userSettings: new Told.SpellWell.Data.UserSettings_LocalStorage()
                };
            }
            Data.createDefaultProviders = createDefaultProviders;
        })(SpellWell.Data || (SpellWell.Data = {}));
        var Data = SpellWell.Data;
    })(Told.SpellWell || (Told.SpellWell = {}));
    var SpellWell = Told.SpellWell;
})(Told || (Told = {}));
