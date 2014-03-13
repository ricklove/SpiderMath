/// <reference path="AccessUserSettings.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (Data) {
            function createDefaultProviders() {
                return {
                    userSettings: new Data.UserSettings_LocalStorage()
                };
            }
            Data.createDefaultProviders = createDefaultProviders;
        })(TableMath.Data || (TableMath.Data = {}));
        var Data = TableMath.Data;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
