/// <reference path="../../typings/jQuery/jQuery.d.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
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

                Object.defineProperty(UserSettings_LocalStorage.prototype, "userList", {
                    get: function () {
                        var valueStr = UserSettings_LocalStorage.getUserSetting("userList");
                        return valueStr.split(";");
                    },
                    set: function (value) {
                        var valueStr = value.join(";");
                        UserSettings_LocalStorage.setUserSetting("userList", valueStr);
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(UserSettings_LocalStorage.prototype, "currentUserId", {
                    get: function () {
                        var valueStr = UserSettings_LocalStorage.getUserSetting("currentUserId");
                        return parseInt(valueStr || "0");
                    },
                    set: function (value) {
                        var valueStr = "" + value;
                        UserSettings_LocalStorage.setUserSetting("currentUserId", valueStr);
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(UserSettings_LocalStorage.prototype, "currentUserState", {
                    get: function () {
                        var userId = this.currentUserId;
                        var valueStr = UserSettings_LocalStorage.getUserSetting("User" + userId + "_State") || "{levels:[]}";
                        return JSON.parse(valueStr);
                    },
                    set: function (value) {
                        var userId = this.currentUserId;
                        var valueStr = JSON.stringify(value);
                        UserSettings_LocalStorage.setUserSetting("User" + userId + "_State", valueStr);
                    },
                    enumerable: true,
                    configurable: true
                });
                return UserSettings_LocalStorage;
            })();
            Data.UserSettings_LocalStorage = UserSettings_LocalStorage;
        })(TableMath.Data || (TableMath.Data = {}));
        var Data = TableMath.Data;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
