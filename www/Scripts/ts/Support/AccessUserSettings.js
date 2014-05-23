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
                        var names = valueStr.split(";");

                        names = names.map(function (n, i) {
                            return n.trim().length === 0 ? "Player " + (i + 1) : n.trim();
                        });

                        return names;
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
                        var id = parseInt(valueStr || "0");

                        id = id < 0 ? 0 : id;
                        id = id > this.userList.length - 1 ? 0 : id;

                        return id;
                    },
                    set: function (value) {
                        var valueStr = "" + value;
                        UserSettings_LocalStorage.setUserSetting("currentUserId", valueStr);
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(UserSettings_LocalStorage.prototype, "currentUserName", {
                    get: function () {
                        return this.userList[this.currentUserId];
                    },
                    set: function (value) {
                        var users = this.userList;
                        var userId = users.indexOf(value);
                        this.currentUserId = userId;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(UserSettings_LocalStorage.prototype, "currentUserState", {
                    get: function () {
                        var userId = this.currentUserId;
                        var valueStr = UserSettings_LocalStorage.getUserSetting("User" + userId + "_State") || JSON.stringify({ levels: [] });
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
