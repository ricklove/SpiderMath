/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessProviders.ts" />
/// <reference path="_Model.ts" />
/// <reference path="TetrisGame.ts" />

module Told.TableMath.UI {

    export class MainViewModel {

        public providers: Data.IProviders;

        constructor(providers?: Data.IProviders) {

            if (providers == null) {
                providers = TableMath.Data.createDefaultProviders();
            }

            this.providers = providers;

            var self = this;

            self.game = new TetrisGame(this);
            self.game.setup(1, 5, 1, 9, false);
            self.board(self.game.board);
        }

        game: IGameUI;
        board = ko.observable<IBoardUI>(null);

        score = ko.observable<number>(0);
        scoreChange = ko.observable<string>("");
        scoreChangeClassName = ko.observable<string>("scoreGood");
        scoreChangeAtId = ko.observable<string>("");

        public changeScore(change: number, showChangeAtId: string = "") {
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


        public keydown(keyCode: number) {
            var self = this;

            if (event.keyCode === 37) {
                self.game.inputDirection(Direction.Left);
            } else if (event.keyCode === 38) {
                self.game.inputDirection(Direction.Up);
            } else if (event.keyCode === 39) {
                self.game.inputDirection(Direction.Right);
            } else if (event.keyCode === 40) {
                self.game.inputDirection(Direction.Down);
            }
        }
    }

    ko.bindingHandlers["globalKeyboard"] = <KnockoutBindingHandler>{
        init: function (element, valueAccessor, allBindingsAccessor, viewModel: MainViewModel) {

            var value = ko.utils.unwrapObservable(valueAccessor());

            $(element).keydown(function (e) {
                viewModel.keydown(e.keyCode);
            });
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