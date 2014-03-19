/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessProviders.ts" />
/// <reference path="_Model.ts" />
/// <reference path="TetrisGame.ts" />
/// <reference path="Levels.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (UI) {
            var MainViewModel = (function () {
                function MainViewModel(providers) {
                    this.board = ko.observable(null);
                    this.isGameOver = ko.observable(false);
                    this._levelIndex = 0;
                    this.level = ko.observable(1);
                    this.world = ko.observable(1);
                    this._levels = Told.TableMath.Game.Levels.GetLevels();
                    this._isNewGame = true;
                    this.score = ko.observable(0);
                    this.scoreChange = ko.observable("");
                    this.scoreChangeClassName = ko.observable("scoreGood");
                    this.scoreChangeAtId = ko.observable("");
                    if (providers == null) {
                        providers = Told.TableMath.Data.createDefaultProviders();
                    }

                    this.providers = providers;

                    var self = this;

                    self._levelIndex = 0;
                    self.setupGame();
                }
                MainViewModel.prototype.setupGame = function () {
                    var self = this;

                    self._isNewGame = true;
                    self.game = new Told.TableMath.Game.TetrisGame(self);
                    var size = 5;
                    var iLevel = self._levelIndex;
                    var levelData = self._levels[iLevel];

                    self.level(levelData.level);
                    self.world(levelData.world);

                    self.game.setup(levelData);
                    self.updateBoard();
                };

                MainViewModel.prototype.gameOver = function (hasWon) {
                    var self = this;

                    if (hasWon) {
                        // Level up
                        self._levelIndex++;
                        self.setupGame();
                    } else {
                        self.isGameOver(true);
                        //setTimeout(function () { self.newGame(); }, 3000);
                    }
                };

                MainViewModel.prototype.newGame = function () {
                    var self = this;

                    self.score(0);
                    self._levelIndex = 0;
                    self.setupGame();

                    self.isGameOver(false);
                };

                MainViewModel.prototype.toBoardPosition = function (gamePositon) {
                    // This supports only cleared lines at the bottom of the game board
                    return { iRow: this.game.board.rows.length - 1 - gamePositon.iRow, iCol: gamePositon.iCol + 1 };
                };

                MainViewModel.prototype.updateBoard = function () {
                    var self = this;
                    var gBoard = self.game.board;

                    // Create the board initially
                    if (self._isNewGame) {
                        self._isNewGame = false;

                        var board = { rows: [] };
                        var rows = board.rows;

                        // Create the header row
                        var headerRow = { cells: [], isVisible: true };

                        var symbol = "x";

                        if (gBoard.isAddition) {
                            symbol = "+";
                        }

                        headerRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable(symbol), gameBoardPosition: null, cellClassName: ko.observable("") });

                        for (var iCol = gBoard.minColumnValue; iCol <= gBoard.maxColumnValue; iCol++) {
                            headerRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable("" + iCol), gameBoardPosition: null, cellClassName: ko.observable("") });
                        }

                        // Right Side
                        headerRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable(symbol), gameBoardPosition: null, cellClassName: ko.observable("") });

                        rows.unshift(headerRow);

                        self.board(board);
                    }

                    // Fix the row count
                    var showClearedRows = true;

                    var gRowCount = gBoard.rows.length;

                    if (!showClearedRows) {
                        gRowCount = gBoard.rows.filter(function (r) {
                            return !r.isCleared;
                        }).length;
                    }

                    var gCellCount = gBoard.rows[0].cells.length;

                    if (gRowCount < self.board().rows.length - 1) {
                        self.board().rows.splice(0, self.board().rows.length - 1 - gRowCount);
                    }

                    while (gRowCount > self.board().rows.length - 1) {
                        var nRow = { cells: [] };
                        self.board().rows.unshift(nRow);

                        // Left side header
                        nRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable(""), cellClassName: ko.observable("") });

                        for (var iCol = 0; iCol < gCellCount; iCol++) {
                            // Value cells
                            nRow.cells.push({ id: ko.observable(""), isHeading: false, text: ko.observable(""), cellClassName: ko.observable("") });
                        }

                        // Right side header
                        nRow.cells.push({ id: ko.observable(""), isHeading: true, text: ko.observable(""), cellClassName: ko.observable("") });
                    }

                    for (var iGameRow = 0; iGameRow < gBoard.rows.length; iGameRow++) {
                        var gRow = gBoard.rows[iGameRow];

                        if (!gRow.isCleared || showClearedRows) {
                            var iRow_UI = self.toBoardPosition({ iRow: iGameRow, iCol: 0 }).iRow;

                            var cRow = self.board().rows[iRow_UI];

                            if (!gRow.isSpecial) {
                                // Left side header
                                cRow.cells[0].text("" + gRow.value);

                                // Right side header
                                cRow.cells[cRow.cells.length - 1].text("" + gRow.value);
                            } else {
                                // Left side header
                                cRow.cells[0].text("");

                                // Right side header
                                cRow.cells[cRow.cells.length - 1].text("");
                            }

                            for (var iCol = 0; iCol < gRow.cells.length; iCol++) {
                                // Put values in rows
                                var iCol_UI = self.toBoardPosition({ iRow: iGameRow, iCol: iCol }).iCol;

                                cRow.cells[iCol_UI].id(gRow.cells[iCol].id);

                                var cssName = gRow.isCleared ? "cleared" : "";

                                cRow.cells[iCol_UI].cellClassName(cssName);

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

                    this.scoreChange.valueHasMutated();

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

            ko.bindingHandlers["globalInput"] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    var value = ko.utils.unwrapObservable(valueAccessor());

                    var doNewGame = function () {
                        if (viewModel.isGameOver()) {
                            viewModel.newGame();
                            return true;
                        } else {
                            return false;
                        }
                    };

                    $(document).keydown(function (e) {
                        if (!doNewGame()) {
                            viewModel.keydown(e.keyCode);
                        }
                    });

                    Hammer(document).on("tap", function (ev) {
                        ev.gesture.preventDefault();

                        if (!doNewGame()) {
                            // If right side, move right
                            if (ev.gesture.center.pageX > window.innerWidth * 0.8) {
                                viewModel.game.inputDirection(1 /* Right */);
                            } else if (ev.gesture.center.pageX < window.innerWidth * 0.2) {
                                // If left side, move left
                                viewModel.game.inputDirection(0 /* Left */);
                            } else {
                                // If center, down
                                viewModel.game.inputDirection(2 /* Down */);
                            }
                        }
                    });

                    Hammer(document).on("dragleft dragright dragdown swipeleft swiperight swipedown", function (ev) {
                        ev.gesture.preventDefault();
                        if (ev.type == 'dragleft' || ev.type == 'dragright' || ev.type == 'dragdown') {
                            return;
                        }

                        // handle the swipes
                        if (!doNewGame()) {
                            if (ev.type == "swipedown") {
                                viewModel.game.inputDirection(2 /* Down */);
                            } else if (ev.type == "swipeleft") {
                                viewModel.game.inputDirection(0 /* Left */);
                            } else if (ev.type == "swiperight") {
                                viewModel.game.inputDirection(1 /* Right */);
                            }
                        }
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
