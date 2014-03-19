/// <reference path="../Core/Game.ts" />

module Told.TableMath.Game {

    export class Levels {
        public static GetLevels(): ILevel[] {

            var levels: ILevel[] = [];

            var t = levelsText;

            var lines = t.split("\r\n");

            for (var i = 0; i < lines.length; i++) {
                var parts = lines[i].split(" ");

                if (parts.length >= 5) {

                    var level: ILevel = {
                        id: parts[0],
                        minColumnValue: parseInt(parts[1]),
                        maxColumnValue: parseInt(parts[2]),
                        minRowValue: parseInt(parts[3]),
                        maxRowValue: parseInt(parts[4]),
                    };

                    levels.push(level);
                }
            }

            return levels;
        }
    }

    var levelsText = ""
        + 'W1L1 1 5 1 5 \r\n'
        + 'W1L2 1 5 2 6 \r\n'
        + 'W1L3 1 5 3 7 \r\n'
        + 'W1L4 1 5 4 8 \r\n'
        + 'W1L5 1 5 5 9 \r\n'
        + 'W1L6 2 6 2 6 \r\n'
        + 'W1L7 2 6 3 7 \r\n'
        + 'W1L8 2 6 4 8 \r\n'
        + 'W1L9 2 6 5 9 \r\n'
        + 'W1L10 3 7 3 7 \r\n'
        + 'W1L11 3 7 4 8 \r\n'
        + 'W1L12 3 7 5 9 \r\n'
        + 'W1L13 4 8 4 8 \r\n'
        + 'W1L14 4 8 5 9 \r\n'
        + 'W1L15 5 9 5 9 \r\n'
        + 'W2L1 1 5 6 10 \r\n'
        + 'W2L2 1 5 7 11 \r\n'
        + 'W2L3 1 5 8 12 \r\n'
        + 'W2L4 2 6 6 10 \r\n'
        + 'W2L5 2 6 7 11 \r\n'
        + 'W2L6 2 6 8 12 \r\n'
        + 'W2L7 3 7 6 10 \r\n'
        + 'W2L8 3 7 7 11 \r\n'
        + 'W2L9 3 7 8 12 \r\n'
        + 'W2L10 4 8 6 10 \r\n'
        + 'W2L11 4 8 7 11 \r\n'
        + 'W2L12 4 8 8 12 \r\n'
        + 'W2L13 5 9 6 10 \r\n'
        + 'W2L14 5 9 7 11 \r\n'
        + 'W2L15 5 9 8 12 \r\n'
        + 'W3L1 6 10 6 10 \r\n'
        + 'W3L2 6 10 7 11 \r\n'
        + 'W3L3 6 10 8 12 \r\n'
        + 'W3L4 7 11 7 11 \r\n'
        + 'W3L5 7 11 8 12 \r\n'
        + 'W3L6 8 12 8 12 \r\n'

    ;
}