/// <reference path="../../typings/jQuery/jQuery.d.ts" />
var Told;
(function (Told) {
    (function (SpellWell) {
        (function (Data) {
            var UserSettings_LocalStorage = (function () {
                function UserSettings_LocalStorage() {
                }
                /*
                * Get User Settings from local storage provider
                *
                * @param key which setting to retrieve
                * @returns the value, or null if not found
                */
                UserSettings_LocalStorage.getUserSetting = function (key) {
                    var value = localStorage.getItem(key);
                    console.log("Get User Setting:" + key + "=" + value);
                    return value;
                };

                UserSettings_LocalStorage.setUserSetting = function (key, value) {
                    localStorage.setItem(key, value);
                    console.log("Set User Setting:" + key + "=" + value);
                };
                return UserSettings_LocalStorage;
            })();
            Data.UserSettings_LocalStorage = UserSettings_LocalStorage;
        })(SpellWell.Data || (SpellWell.Data = {}));
        var Data = SpellWell.Data;
    })(Told.SpellWell || (Told.SpellWell = {}));
    var SpellWell = Told.SpellWell;
})(Told || (Told = {}));
