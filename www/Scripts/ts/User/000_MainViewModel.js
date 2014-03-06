/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessProviders.ts" />
var Told;
(function (Told) {
    (function (SpellWell) {
        (function (UI) {
            var MainViewModel = (function () {
                function MainViewModel(providers) {
                    this.nextNumber = ko.observable(0);
                    this.remainingNumbers = [];
                    this.min = ko.observable(2);
                    this.size = ko.observable(8);
                    this.score = ko.observable(0);
                    this.scoreChange = ko.observable("");
                    this.scoreChangeClassName = ko.observable("scoreGood");
                    this.isAddition = false;
                    this._lines = null;
                    if (providers == null) {
                        providers = Told.SpellWell.Data.createDefaultProviders();
                    }

                    this.providers = providers;

                    var self = this;

                    var t = { rows: [] };
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
                            } else if (j === 0) {
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
                                }());
                            }
                        }
                    }

                    this.changeNumber();
                    this.runTimer();
                }
                MainViewModel.prototype.changeScore = function (change, showChange) {
                    if (typeof showChange === "undefined") { showChange = true; }
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
                };

                MainViewModel.prototype.changeNumber = function () {
                    var iRandom = Math.floor(Math.random() * this.remainingNumbers.length);
                    this.nextNumber(this.remainingNumbers[iRandom]);

                    this.remainingNumbers.splice(iRandom, 1);
                    // FOR DEBUG
                    //if (this.nextNumber() == 0) {
                    //    this.nextNumber(4);
                    //}
                    //this.nextNumber(this.nextNumber() + 2);
                };

                MainViewModel.prototype.runTimer = function () {
                    var self = this;

                    var reduceScore = function () {
                        self.changeScore(-1, false);

                        setTimeout(reduceScore, 10000);
                    };

                    setTimeout(reduceScore, 20000);
                };

                MainViewModel.prototype.clickSquare = function (i, j) {
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
                    } else {
                        this.changeScore(-5);
                    }
                };

                MainViewModel.prototype.checkForLines = function () {
                    var minLineLength = 4;
                    var self = this;

                    var size = self.size();

                    var lineParts = [];

                    var checkLine = function (line) {
                        var curLine = [];

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
                };

                MainViewModel.createLines = function (size) {
                    var lines = [];

                    var createLines = function (getStartingPlaces, nextPlace) {
                        var sPlaces = getStartingPlaces();

                        for (var i = 0; i < sPlaces.length; i++) {
                            var p = sPlaces[i];

                            var line = [];

                            while (p.iCol > 0 && p.iCol < size + 1 && p.iRow > 0 && p.iRow < size + 1) {
                                line.push(p);
                                p = nextPlace(p);
                            }

                            lines.push(line);
                        }
                    };

                    //// Horizontal
                    createLines(function () {
                        var places = [];

                        for (var s = 1; s < size + 1; s++) {
                            places.push({ iRow: s, iCol: 1 });
                        }

                        return places;
                    }, function (p) {
                        return { iRow: p.iRow, iCol: p.iCol + 1 };
                    });

                    //// Vertical
                    createLines(function () {
                        var places = [];

                        for (var s = 1; s < size + 1; s++) {
                            places.push({ iRow: 1, iCol: s });
                        }

                        return places;
                    }, function (p) {
                        return { iRow: p.iRow + 1, iCol: p.iCol };
                    });

                    // Diagonal
                    createLines(function () {
                        var places = [];

                        for (var s = 1; s < size + 1; s++) {
                            places.push({ iRow: 1, iCol: s });
                        }

                        for (var s = 2; s < size + 1; s++) {
                            places.push({ iRow: s, iCol: 1 });
                        }

                        return places;
                    }, function (p) {
                        return { iRow: p.iRow + 1, iCol: p.iCol + 1 };
                    });

                    // Reverse Diagonal
                    createLines(function () {
                        var places = [];

                        for (var s = 1; s < size + 1; s++) {
                            places.push({ iRow: 1, iCol: s });
                        }

                        for (var s = 2; s < size + 1; s++) {
                            places.push({ iRow: s, iCol: size });
                        }

                        return places;
                    }, function (p) {
                        return { iRow: p.iRow + 1, iCol: p.iCol - 1 };
                    });

                    return lines;
                };
                return MainViewModel;
            })();
            UI.MainViewModel = MainViewModel;
        })(SpellWell.UI || (SpellWell.UI = {}));
        var UI = SpellWell.UI;
    })(Told.SpellWell || (Told.SpellWell = {}));
    var SpellWell = Told.SpellWell;
})(Told || (Told = {}));
