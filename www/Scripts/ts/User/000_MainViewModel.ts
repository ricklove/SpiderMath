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
        onClick: () => void;
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
                    var val = valI * valJ;

                    if (i === 0) {
                        if (j === 0) {
                            t.rows[i].values[j] = { text: ko.observable("x"), value: null, isHeading: true, onClick: null };
                        } else {
                            t.rows[i].values[j] = { text: ko.observable("" + valJ), value: null, isHeading: true, onClick: null };
                        }
                    }
                    else if (j === 0) {
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
                        } ());
                    }
                }
            }

            this.changeNumber();
        }

        table: INumberTable;
        nextNumber = ko.observable<number>(0);
        remainingNumbers: number[] = [];

        min = ko.observable<number>(2);
        size = ko.observable<number>(8);

        score = ko.observable<number>(0);

        public changeNumber() {
            var iRandom = Math.floor(Math.random() * this.remainingNumbers.length);
            this.nextNumber(this.remainingNumbers[iRandom]);

            this.remainingNumbers.splice(iRandom, 1);
        }

        public clickSquare(i: number, j: number) {
            console.log("Clicked: " + i + "," + j);

            var v = this.table.rows[i].values[j];

            if (this.nextNumber() == v.value) {
                v.text("" + v.value);
                this.changeNumber();

                this.score(this.score() + 10);
            }
            else {
                this.score(this.score() + -5);
            }
        }

    }


}