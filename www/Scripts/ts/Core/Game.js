var Told;
(function (Told) {
    (function (TableMath) {
        (function (Game) {
            (function (Direction) {
                Direction[Direction["Left"] = 0] = "Left";
                Direction[Direction["Right"] = 1] = "Right";
                Direction[Direction["Down"] = 2] = "Down";
                Direction[Direction["Up"] = 3] = "Up";
            })(Game.Direction || (Game.Direction = {}));
            var Direction = Game.Direction;
        })(TableMath.Game || (TableMath.Game = {}));
        var Game = TableMath.Game;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
