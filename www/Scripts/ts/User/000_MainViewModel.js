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
                            var val = valI * valJ;

                            if (i === 0) {
                                if (j === 0) {
                                    t.rows[i].values[j] = { text: ko.observable("x"), value: null, isHeading: true, onClick: null };
                                } else {
                                    t.rows[i].values[j] = { text: ko.observable("" + valJ), value: null, isHeading: true, onClick: null };
                                }
                            } else if (j === 0) {
                                t.rows[i].values[j] = { text: ko.observable("" + valI), value: null, isHeading: true, onClick: null };
                            } else {
                                (function () {
                                    var i2 = i;
                                    var j2 = j;
                                    var self2 = self;
                                    t.rows[i].values[j] = {
                                        text: ko.observable("-"), value: val, isHeading: false, onClick: function () {
                                            self2.clickSquare(i2, j2);
                                        }
                                    };

                                    self.remainingNumbers.push(i * j);
                                }());
                            }
                        }
                    }

                    this.changeNumber();
                }
                MainViewModel.prototype.changeNumber = function () {
                    var iRandom = Math.floor(Math.random() * this.remainingNumbers.length);
                    this.nextNumber(this.remainingNumbers[iRandom]);

                    this.remainingNumbers.splice(iRandom, 1);
                };

                MainViewModel.prototype.clickSquare = function (i, j) {
                    console.log("Clicked: " + i + "," + j);

                    var v = this.table.rows[i].values[j];

                    if (this.nextNumber() == v.value) {
                        v.text("" + v.value);
                        this.changeNumber();

                        this.score(this.score() + 10);
                    } else {
                        this.score(this.score() + -5);
                    }
                };
                return MainViewModel;
            })();
            UI.MainViewModel = MainViewModel;
        })(SpellWell.UI || (SpellWell.UI = {}));
        var UI = SpellWell.UI;
    })(Told.SpellWell || (Told.SpellWell = {}));
    var SpellWell = Told.SpellWell;
})(Told || (Told = {}));
