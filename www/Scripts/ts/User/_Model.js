/// <reference path="../../typings/knockout/knockout.d.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (UI) {
            (function (Direction) {
                Direction[Direction["Left"] = 0] = "Left";
                Direction[Direction["Right"] = 1] = "Right";
                Direction[Direction["Down"] = 2] = "Down";
                Direction[Direction["Up"] = 3] = "Up";
            })(UI.Direction || (UI.Direction = {}));
            var Direction = UI.Direction;
        })(TableMath.UI || (TableMath.UI = {}));
        var UI = TableMath.UI;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
