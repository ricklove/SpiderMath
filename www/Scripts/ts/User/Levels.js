/// <reference path="../Core/Game.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (Game) {
            var Levels = (function () {
                function Levels() {
                }
                Levels.GetLevels = function () {
                    var levels = [];

                    var t = levelsText;

                    var lines = t.split("\r\n");

                    for (var i = 0; i < lines.length; i++) {
                        var parts = lines[i].split(" ");

                        if (parts.length >= 7) {
                            var level = {
                                id: parts[0],
                                world: parseInt(parts[1]),
                                level: parseInt(parts[2]),
                                minColumnValue: parseInt(parts[3]),
                                maxColumnValue: parseInt(parts[4]),
                                minRowValue: parseInt(parts[5]),
                                maxRowValue: parseInt(parts[6])
                            };

                            levels.push(level);
                        }
                    }

                    return levels;
                };
                return Levels;
            })();
            Game.Levels = Levels;

            var levelsText = "" + 'W1L1 1 1 1 5 1 5 \r\n' + 'W1L2 1 2 1 5 2 6 \r\n' + 'W1L3 1 3 1 5 3 7 \r\n' + 'W1L4 1 4 1 5 4 8 \r\n' + 'W1L5 1 5 1 5 5 9 \r\n' + 'W1L6 1 6 2 6 2 6 \r\n' + 'W1L7 1 7 2 6 3 7 \r\n' + 'W1L8 1 8 2 6 4 8 \r\n' + 'W1L9 1 9 2 6 5 9 \r\n' + 'W1L10 1 10 3 7 3 7 \r\n' + 'W1L11 1 11 3 7 4 8 \r\n' + 'W1L12 1 12 3 7 5 9 \r\n' + 'W1L13 1 13 4 8 4 8 \r\n' + 'W1L14 1 14 4 8 5 9 \r\n' + 'W1L15 1 15 5 9 5 9 \r\n' + 'W2L1 2 1 1 5 6 10 \r\n' + 'W2L2 2 2 1 5 7 11 \r\n' + 'W2L3 2 3 1 5 8 12 \r\n' + 'W2L4 2 4 2 6 6 10 \r\n' + 'W2L5 2 5 2 6 7 11 \r\n' + 'W2L6 2 6 2 6 8 12 \r\n' + 'W2L7 2 7 3 7 6 10 \r\n' + 'W2L8 2 8 3 7 7 11 \r\n' + 'W2L9 2 9 3 7 8 12 \r\n' + 'W2L10 2 10 4 8 6 10 \r\n' + 'W2L11 2 11 4 8 7 11 \r\n' + 'W2L12 2 12 4 8 8 12 \r\n' + 'W2L13 2 13 5 9 6 10 \r\n' + 'W2L14 2 14 5 9 7 11 \r\n' + 'W2L15 2 15 5 9 8 12 \r\n' + 'W3L1 3 1 6 10 6 10 \r\n' + 'W3L2 3 2 6 10 7 11 \r\n' + 'W3L3 3 3 6 10 8 12 \r\n' + 'W3L4 3 4 7 11 7 11 \r\n' + 'W3L5 3 5 7 11 8 12 \r\n' + 'W3L6 3 6 8 12 8 12 \r\n';
        })(TableMath.Game || (TableMath.Game = {}));
        var Game = TableMath.Game;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
