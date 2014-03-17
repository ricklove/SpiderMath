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

                    self.game = new Told.TableMath.Game.TetrisGame(this);
                    self.game.setup(1, 5, 1, 9, false);
                    self.updateBoard();
                }
                MainViewModel.prototype.toBoardPosition = function (gamePositon) {
                    // This supports only cleared lines at the bottom of the game board
                    return { iRow: this.game.board.rows.length - 1 - gamePositon.iRow, iCol: gamePositon.iCol + 1 };
                };

                MainViewModel.prototype.updateBoard = function () {
                    var self = this;
                    var gBoard = self.game.board;

                    // Create the board initially
                    if (self.board() == null) {
                        var board = { rows: [] };
                        var rows = board.rows;

                        // Create the header row
                        var headerRow = { cells: [], isVisible: true };

                        var symbol = "x";

                        if (gBoard.isAddition) {
                            symbol = "+";
                        }

                        headerRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable(symbol), gameBoardPosition: null });

                        for (var iCol = gBoard.minColumnValue; iCol <= gBoard.maxColumnValue; iCol++) {
                            headerRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable("" + iCol), gameBoardPosition: null });
                        }

                        // Right Side
                        headerRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable(symbol), gameBoardPosition: null });

                        rows.unshift(headerRow);

                        self.board(board);
                    }

                    // Fix the row count
                    var gRowCount = gBoard.rows.filter(function (r) {
                        return !r.isCleared;
                    }).length;
                    var gCellCount = gBoard.rows[0].cells.length;

                    if (gRowCount < self.board().rows.length - 1) {
                        self.board().rows.splice(0, self.board().rows.length - 1 - gRowCount);
                    }

                    while (gRowCount > self.board().rows.length - 1) {
                        var nRow = { cells: [] };
                        self.board().rows.unshift(nRow);

                        // Left side header
                        nRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable("") });

                        for (var iCol = 0; iCol < gCellCount; iCol++) {
                            // Value cells
                            nRow.cells.push({ id: ko.observable(""), isHeading: false, text: ko.observable("") });
                        }

                        // Right side header
                        nRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable("") });
                    }

                    for (var iGameRow = 0; iGameRow < gBoard.rows.length; iGameRow++) {
                        var gRow = gBoard.rows[iGameRow];

                        if (!gRow.isCleared) {
                            var iRow_UI = self.toBoardPosition({ iRow: iGameRow, iCol: 0 }).iRow;

                            var cRow = self.board().rows[iRow_UI];

                            // Left side header
                            cRow.cells[0].text("" + gRow.value);

                            // Right side header
                            cRow.cells[cRow.cells.length - 1].text("" + gRow.value);

                            for (var iCol = 0; iCol < gRow.cells.length; iCol++) {
                                // Put values in rows
                                var iCol_UI = self.toBoardPosition({ iRow: iGameRow, iCol: iCol }).iCol;

                                cRow.cells[iCol_UI].id(gRow.cells[iCol].id);

                                if (gRow.cells[iCol].isAnswered) {
                                    cRow.cells[iCol_UI].text("" + gRow.cells[iCol].value);
                                } else {
                                    cRow.cells[iCol_UI].text("");
                                }
                            }
                        }
                    }

                    // Show falling value
                    if (self.game.fallingNumber != null) {
                        var fPos = self.toBoardPosition(self.game.fallingNumberPosition);
                        self.board().rows[fPos.iRow].cells[fPos.iCol].text("" + self.game.fallingNumber);
                    }

                    self.board.valueHasMutated();
                };

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
