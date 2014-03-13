/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessProviders.ts" />
/// <reference path="_Model.ts" />
/// <reference path="TetrisGame.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (UI) {
            var MainViewModel = (function () {
                function MainViewModel(providers) {
                    this.board = ko.observable(null);
                    this.score = ko.observable(0);
                    this.scoreChange = ko.observable("");
                    this.scoreChangeClassName = ko.observable("scoreGood");
                    this.scoreChangeAtId = ko.observable("");
                    if (providers == null) {
                        providers = Told.TableMath.Data.createDefaultProviders();
                    }

                    this.providers = providers;

                    var self = this;

                    self.game = new Told.TableMath.UI.TetrisGame(this);
                    self.game.setup(1, 5, 1, 9, false);
                    self.board(self.game.board);
                }
                MainViewModel.prototype.changeScore = function (change, showChangeAtId) {
                    if (typeof showChangeAtId === "undefined") { showChangeAtId = ""; }
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
                };

                MainViewModel.prototype.keydown = function (keyCode) {
                    var self = this;

                    if (event.keyCode === 37) {
                        self.game.inputDirection(0 /* Left */);
                    } else if (event.keyCode === 38) {
                        self.game.inputDirection(3 /* Up */);
                    } else if (event.keyCode === 39) {
                        self.game.inputDirection(1 /* Right */);
                    } else if (event.keyCode === 40) {
                        self.game.inputDirection(2 /* Down */);
                    }
                };
                return MainViewModel;
            })();
            UI.MainViewModel = MainViewModel;

            ko.bindingHandlers["globalKeyboard"] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    var value = ko.utils.unwrapObservable(valueAccessor());

                    $(element).keydown(function (e) {
                        viewModel.keydown(e.keyCode);
                    });
                }
            };

            ko.bindingHandlers["fadeText"] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    $(element).text(ko.unwrap(valueAccessor()));
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    if ($(element).text() != ko.unwrap(valueAccessor())) {
                        $(element).fadeOut(500, function () {
                            $(element).text(ko.unwrap(valueAccessor()));
                        });
                        $(element).fadeIn({ queue: true });
                    }
                }
            };

            ko.bindingHandlers["animScoreChange"] = {
                init: function (element) {
                    $(element).hide();
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
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
                    scElement.animate({ fontSize: "+=2em", top: endPosition.top, left: endPosition.left }, 500, "swing", function () {
                        //scElement.animate({ opacity: "0" }, 500, () => { scElement.hide(); });
                        scElement.hide();
                    });
                    // At end make it nothing
                    //viewModel.scoreChange("");
                }
            };
        })(TableMath.UI || (TableMath.UI = {}));
        var UI = TableMath.UI;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
