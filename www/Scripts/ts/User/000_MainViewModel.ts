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
        id: string;
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
                            t.rows[i].values[j] = { id: "", text: ko.observable(sign), value: null, isHeading: true, onClick: null, isAnswered: false };
                        } else {
                            t.rows[i].values[j] = { id: "", text: ko.observable("" + valJ), value: null, isHeading: true, onClick: null, isAnswered: false };
                        }
                    }
                    else if (j === 0) {
                        t.rows[i].values[j] = { id: "", text: ko.observable("" + valI), value: null, isHeading: true, onClick: null, isAnswered: false };
                    } else {
                        (function () {
                            var i2 = i;
                            var j2 = j;
                            var self2 = self;
                            t.rows[i].values[j] = {
                                id: "NumSq_" + i + "_" + j,
                                text: ko.observable("-"),
                                value: val,
                                isHeading: false,
                                isAnswered: false,
                                onClick: function () {
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
        scoreChangeAtId = ko.observable<string>("");

        isAddition = false;

        private changeScore(change: number, showChangeAtId: string = "") {
            if (showChangeAtId != "") {

                this.scoreChangeAtId(showChangeAtId);

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
                self.changeScore(-1);

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

                    this.changeScore(10, v.id);

                    var self = this;
                    setTimeout(() => { self.checkForLines(); }, 1000);
                }
            }
            else {
                this.changeScore(-5, v.id);
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
                self.changeScore(points, self.scoreChangeAtId());

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

    ko.bindingHandlers["fadeText"] = <KnockoutBindingHandler>{
        init: function (element, valueAccessor, allBindingsAccessor, viewModel: MainViewModel) {
            $(element).text(ko.unwrap(valueAccessor()));
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel: MainViewModel) {

            if ($(element).text() != ko.unwrap(valueAccessor())) {
                $(element).fadeOut(500, () => { $(element).text(ko.unwrap(valueAccessor())); });
                $(element).fadeIn({ queue: true });
            }
        }
    }

    ko.bindingHandlers["animScoreChange"] = <KnockoutBindingHandler>{
        init: function (element) {
            $(element).hide();
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel: MainViewModel) {

            console.log("slideUpAndFadeOut Update:" + element.id);

            ko.utils.unwrapObservable(valueAccessor()); // to subscribe

            if (viewModel.scoreChange() == "") {
                return;
            }

            // Use jQuery animation
            var atElement = $("#" + viewModel.scoreChangeAtId());
            var startPosition = atElement.offset();
            var endPosition = $("#score").offset();

            var scElement = $(element);

            scElement.stop(true, true);
            scElement.css({ fontSize: "2em", opacity: "100", top: startPosition.top, left: startPosition.left });
            //scElement.offset(startPosition);

            scElement.show();
            scElement.animate({ fontSize: "+=2em", top: endPosition.top, left: endPosition.left }, 500, "swing", () => {
                //scElement.animate({ opacity: "0" }, 500, () => { scElement.hide(); });
                scElement.hide();
            });

            // At end make it nothing
            //viewModel.scoreChange("");
        }
    };

}