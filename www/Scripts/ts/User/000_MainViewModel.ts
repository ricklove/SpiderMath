/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessProviders.ts" />

module Told.SpellWell.UI {

    export interface INumberTable {
        rows: INumberRow[];
    }

    export interface INumberRow {
        values: INumberValue[]
    }

    export interface INumberValue {
        text: KnockoutObservable<string>;

        isHeading: boolean;

        value: number;
        isAnswered: boolean;

        onClick: () => void;
    }

    interface IPlace {
        iRow: number;
        iCol: number;
    }

    export class MainViewModel {

        public providers: Data.IProviders;

        constructor(providers?: Data.IProviders) {

            if (providers == null) {
                providers = SpellWell.Data.createDefaultProviders();
            }

            this.providers = providers;

            var self = this;

            var t = <INumberTable> { rows: [] };
            this.table = t;
            var min = this.min();
            var size = this.size();


            for (var i = 0; i <= size; i++) {

                t.rows[i] = { values: [] };

                for (var j = 0; j <= size; j++) {

                    var valI = i + min - 1;
                    var valJ = j + min - 1;

                    var val = this.isAddition ? valI + valJ : valI * valJ;
                    var sign = this.isAddition ? "+" : "x";

                    if (i === 0) {
                        if (j === 0) {
                            t.rows[i].values[j] = { text: ko.observable(sign), value: null, isHeading: true, onClick: null, isAnswered: false };
                        } else {
                            t.rows[i].values[j] = { text: ko.observable("" + valJ), value: null, isHeading: true, onClick: null, isAnswered: false };
                        }
                    }
                    else if (j === 0) {
                        t.rows[i].values[j] = { text: ko.observable("" + valI), value: null, isHeading: true, onClick: null, isAnswered: false };
                    } else {
                        (function () {
                            var i2 = i;
                            var j2 = j;
                            var self2 = self;
                            t.rows[i].values[j] = {
                                text: ko.observable("-"), value: val, isHeading: false, isAnswered: false, onClick: function () {
                                    self2.clickSquare(i2, j2);
                                }
                            };

                            self.remainingNumbers.push(val);
                        } ());
                    }
                }
            }

            this.changeNumber();
            this.runTimer();
        }

        table: INumberTable;
        nextNumber = ko.observable<number>(0);
        remainingNumbers: number[] = [];

        min = ko.observable<number>(2);
        size = ko.observable<number>(8);

        score = ko.observable<number>(0);
        scoreChange = ko.observable<string>("");
        scoreChangeClassName = ko.observable<string>("scoreGood");

        isAddition = false;

        private changeScore(change: number, showChange: boolean = true) {
            if (showChange) {

                if (change > 0) {
                    this.scoreChange("+" + change);
                    this.scoreChangeClassName("scoreGood");
                } else {
                    this.scoreChange("" + change);
                    this.scoreChangeClassName("scoreBad");
                }
            }

            this.score(this.score() + change);
        }

        public changeNumber() {
            var iRandom = Math.floor(Math.random() * this.remainingNumbers.length);
            this.nextNumber(this.remainingNumbers[iRandom]);

            this.remainingNumbers.splice(iRandom, 1);

            // FOR DEBUG
            //if (this.nextNumber() == 0) {
            //    this.nextNumber(4);
            //}

            //this.nextNumber(this.nextNumber() + 2);
        }

        public runTimer() {
            var self = this;

            var reduceScore = function () {
                self.changeScore(-1, false);

                setTimeout(reduceScore, 10000);
            };

            setTimeout(reduceScore, 20000);
        }

        public clickSquare(i: number, j: number) {
            console.log("Clicked: " + i + "," + j);

            var v = this.table.rows[i].values[j];

            if (this.nextNumber() == v.value) {
                if (!v.isAnswered) {
                    v.text("" + v.value);
                    v.isAnswered = true;

                    this.changeNumber();

                    this.changeScore(10);

                    this.checkForLines();
                }
            }
            else {
                this.changeScore(-5);
            }
        }

        public checkForLines() {

            var minLineLength = 4;
            var self = this;

            var size = self.size();

            var lineParts: INumberValue[] = [];

            var checkLine = function (line: IPlace[]) {

                var curLine: INumberValue[] = [];

                for (var iLine = 0; iLine < line.length; iLine++) {

                    var p = line[iLine];
                    var val = self.table.rows[p.iRow].values[p.iCol];

                    // Add to curLine
                    if (val.isAnswered) {
                        curLine.push(val);
                    } else {
                        // If line broken, restert
                        if (curLine.length >= minLineLength) {
                            lineParts = lineParts.concat(curLine);
                        }
                        curLine = [];
                    }
                }

                if (curLine.length >= minLineLength) {
                    lineParts = lineParts.concat(curLine);
                }

            };

            // Iterate lines
            if (self._lines == null) {
                self._lines = MainViewModel.createLines(self.size());
            }

            for (var iLine = 0; iLine < self._lines.length; iLine++) {
                checkLine(self._lines[iLine]);
            }

            // Clear and give points
            if (lineParts.length > 0) {
                var points = lineParts.length * lineParts.length;
                self.changeScore(points);

                for (var iPart = 0; iPart < lineParts.length; iPart++) {
                    lineParts[iPart].isAnswered = false;
                    lineParts[iPart].text("-");
                }
            }

        }

        private _lines: IPlace[][] = null;

        private static createLines(size: number): IPlace[][] {

            var lines: IPlace[][] = [];

            var createLines = function (getStartingPlaces: () => IPlace[], nextPlace: (p: IPlace) => IPlace) {
                var sPlaces = getStartingPlaces();

                for (var i = 0; i < sPlaces.length; i++) {
                    var p = sPlaces[i];

                    var line: IPlace[] = [];

                    while (p.iCol > 0 && p.iCol < size + 1 && p.iRow > 0 && p.iRow < size + 1) {
                        line.push(p);
                        p = nextPlace(p);
                    }

                    lines.push(line);
                }
            };

            //// Horizontal
            createLines(() => {
                var places: IPlace[] = [];

                for (var s = 1; s < size + 1; s++) {
                    places.push({ iRow: s, iCol: 1 });
                }

                return places;

            }, (p) => { return { iRow: p.iRow, iCol: p.iCol + 1 } });

            //// Vertical
            createLines(() => {
                var places: IPlace[] = [];

                for (var s = 1; s < size + 1; s++) {
                    places.push({ iRow: 1, iCol: s });
                }

                return places;

            }, (p) => { return { iRow: p.iRow + 1, iCol: p.iCol } });

            // Diagonal
            createLines(() => {
                var places: IPlace[] = [];

                for (var s = 1; s < size + 1; s++) {
                    places.push({ iRow: 1, iCol: s });
                }

                for (var s = 2; s < size + 1; s++) {
                    places.push({ iRow: s, iCol: 1 });
                }

                return places;

            }, (p) => { return { iRow: p.iRow + 1, iCol: p.iCol + 1 } });

            // Reverse Diagonal
            createLines(() => {
                var places: IPlace[] = [];

                for (var s = 1; s < size + 1; s++) {
                    places.push({ iRow: 1, iCol: s });
                }

                for (var s = 2; s < size + 1; s++) {
                    places.push({ iRow: s, iCol: size });
                }

                return places;

            }, (p) => { return { iRow: p.iRow + 1, iCol: p.iCol - 1 } });


            return lines;
        }

    }


}