/// <reference path="../Core/Game.ts" />

module Told.TableMath.Game {

    export class Levels {
        public static GetLevels(): ILevel[] {

            var levels: ILevel[] = [];

            var t = levelsText.replace(/ +/g, " ");

            var lines = t.split("\r\n");

            for (var i = 0; i < lines.length; i++) {
                var parts = lines[i].split(" ");

                if (parts.length >= 7) {

                    var level: ILevel = {
                        id: parts[0],
                        world: parseInt(parts[1]),
                        level: parseInt(parts[2]),
                        minColumnValue: parseInt(parts[3]),
                        maxColumnValue: parseInt(parts[4]),
                        minRowValue: parseInt(parts[5]),
                        maxRowValue: parseInt(parts[6]),
                    };

                    levels.push(level);
                }
            }

            return levels;
        }
    }

    var levelsText = ""
        + 'W1L1 1 1  1 5 1 5 \r\n'
        + 'W1L2 1 2  1 5 2 6 \r\n'
        + 'W1L3 1 3  1 5 3 7 \r\n'
        + 'W1L4 1 4  1 5 4 8 \r\n'
        + 'W1L5 1 5  1 5 5 9 \r\n'
        + 'W2L1 2 1  2 6 1 5 \r\n'
        + 'W2L2 2 2  2 6 2 6 \r\n'
        + 'W2L3 2 3  2 6 3 7 \r\n'
        + 'W2L4 2 4  2 6 4 8 \r\n'
        + 'W2L5 2 5  2 6 5 9 \r\n'
        + 'W3L1 3 1  3 7 1 5 \r\n'
        + 'W3L2 3 2  3 7 2 6 \r\n'
        + 'W3L3 3 3  3 7 3 7 \r\n'
        + 'W3L4 3 4  3 7 4 8 \r\n'
        + 'W3L5 3 5  3 7 5 9 \r\n'
        + 'W4L1 4 1  4 8 1 5 \r\n'
        + 'W4L2 4 2  4 8 2 6 \r\n'
        + 'W4L3 4 3  4 8 3 7 \r\n'
        + 'W4L4 4 4  4 8 4 8 \r\n'
        + 'W4L5 4 5  4 8 5 9 \r\n'
        + 'W5L1 5 1  5 9 1 5 \r\n'
        + 'W5L2 5 2  5 9 2 6 \r\n'
        + 'W5L3 5 3  5 9 3 7 \r\n'
        + 'W5L4 5 4  5 9 4 8 \r\n'
        + 'W5L5 5 5  5 9 5 9 \r\n'
        + 'W6L1 6 1  6 10 1 5 \r\n'
        + 'W6L2 6 2  6 10 2 6 \r\n'
        + 'W6L3 6 3  6 10 3 7 \r\n'
        + 'W6L4 6 4  6 10 4 8 \r\n'
        + 'W6L5 6 5  6 10 5 9 \r\n'
        + 'W6L6 6 6  6 10 6 10 \r\n'
        + 'W7L1 7 1  7 11 1 5 \r\n'
        + 'W7L2 7 2  7 11 2 6 \r\n'
        + 'W7L3 7 3  7 11 3 7 \r\n'
        + 'W7L4 7 4  7 11 4 8 \r\n'
        + 'W7L5 7 5  7 11 5 9 \r\n'
        + 'W7L6 7 6  7 11 6 10 \r\n'
        + 'W7L7 7 7  7 11 7 11 \r\n'
        + 'W8L1 8 1  8 12 1 5 \r\n'
        + 'W8L2 8 2  8 12 2 6 \r\n'
        + 'W8L3 8 3  8 12 3 7 \r\n'
        + 'W8L4 8 4  8 12 4 8 \r\n'
        + 'W8L5 8 5  8 12 5 9 \r\n'
        + 'W8L6 8 6  8 12 6 10 \r\n'
        + 'W8L7 8 7  8 12 7 11 \r\n'
        + 'W8L8 8 8  8 12 8 12 \r\n'
        + 'W9L1 9 1  9 13 1 5 \r\n'
        + 'W9L2 9 2  9 13 2 6 \r\n'
        + 'W9L3 9 3  9 13 3 7 \r\n'
        + 'W9L4 9 4  9 13 4 8 \r\n'
        + 'W9L5 9 5  9 13 5 9 \r\n'
        + 'W9L6 9 6  9 13 6 10 \r\n'
        + 'W9L7 9 7  9 13 7 11 \r\n'
        + 'W9L8 9 8  9 13 8 12 \r\n'
        + 'W9L9 9 9  9 13 9 13 \r\n'
        + 'W10L1 10 1  10 14 1 5 \r\n'
        + 'W10L2 10 2  10 14 2 6 \r\n'
        + 'W10L3 10 3  10 14 3 7 \r\n'
        + 'W10L4 10 4  10 14 4 8 \r\n'
        + 'W10L5 10 5  10 14 5 9 \r\n'
        + 'W10L6 10 6  10 14 6 10 \r\n'
        + 'W10L7 10 7  10 14 7 11 \r\n'
        + 'W10L8 10 8  10 14 8 12 \r\n'
        + 'W10L9 10 9  10 14 9 13 \r\n'
        + 'W10L10 10 10  10 14 10 14 \r\n'
        + 'W11L1 11 1  11 15 1 5 \r\n'
        + 'W11L2 11 2  11 15 2 6 \r\n'
        + 'W11L3 11 3  11 15 3 7 \r\n'
        + 'W11L4 11 4  11 15 4 8 \r\n'
        + 'W11L5 11 5  11 15 5 9 \r\n'
        + 'W11L6 11 6  11 15 6 10 \r\n'
        + 'W11L7 11 7  11 15 7 11 \r\n'
        + 'W11L8 11 8  11 15 8 12 \r\n'
        + 'W11L9 11 9  11 15 9 13 \r\n'
        + 'W11L10 11 10  11 15 10 14 \r\n'
        + 'W11L11 11 11  11 15 11 15 \r\n'
        + 'W12L1 12 1  12 16 1 5 \r\n'
        + 'W12L2 12 2  12 16 2 6 \r\n'
        + 'W12L3 12 3  12 16 3 7 \r\n'
        + 'W12L4 12 4  12 16 4 8 \r\n'
        + 'W12L5 12 5  12 16 5 9 \r\n'
        + 'W12L6 12 6  12 16 6 10 \r\n'
        + 'W12L7 12 7  12 16 7 11 \r\n'
        + 'W12L8 12 8  12 16 8 12 \r\n'
        + 'W12L9 12 9  12 16 9 13 \r\n'
        + 'W12L10 12 10  12 16 10 14 \r\n'
        + 'W12L11 12 11  12 16 11 15 \r\n'
        + 'W12L12 12 12  12 16 12 16 \r\n'



    ;
}