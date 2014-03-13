/// <reference path="_Model.ts" />
///// <reference path="../Core/Game.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (UI) {
            var TetrisGame = (function () {
                function TetrisGame(viewModel) {
                    this._tickTime = 2000;
                    this.tickTimeoutId = null;
                    this._viewModel = viewModel;
                }
                TetrisGame.prototype.setup = function (minColumnValue, maxColumnValue, minRowValue, maxRowValue, isAddition) {
                    if (typeof isAddition === "undefined") { isAddition = false; }
                    var self = this;

                    self._isAddition = isAddition;
                    self._minColumnValue = minColumnValue;
                    self._maxColumnValue = maxColumnValue;

                    var rows = [];
                    var board = { rows: rows };

                    // Create the header row
                    var headerRow = { values: [] };

                    var symbol = "x";

                    if (isAddition) {
                        symbol = "+";
                    }

                    headerRow.values.push({ id: "", isHeading: true, text: ko.observable(symbol), value: 0, isAnswered: false });

                    for (var iCol = minColumnValue; iCol <= maxColumnValue; iCol++) {
                        headerRow.values.push({ id: "", isHeading: true, text: ko.observable("" + iCol), value: 0, isAnswered: false });
                    }

                    rows.unshift(headerRow);

                    for (var iRow = minRowValue; iRow <= maxRowValue; iRow++) {
                        rows.unshift(TetrisGame.createRow(minColumnValue, maxColumnValue, iRow, self._isAddition));
                    }

                    self.board = board;

                    self.start();
                };

                TetrisGame.createRow = function (minColumnValue, maxColumnValue, rowVal, isAddition) {
                    var vRow = { values: [] };

                    // Create side header
                    vRow.values.push({ id: "", isHeading: true, text: ko.observable("" + rowVal), value: rowVal, isAnswered: false });

                    for (var iCol = minColumnValue; iCol <= maxColumnValue; iCol++) {
                        var val = rowVal * iCol;

                        if (isAddition) {
                            val = rowVal + iCol;
                        }

                        vRow.values.push({ id: "V_" + rowVal + "_" + iCol, isHeading: false, text: ko.observable(""), value: val, isAnswered: false });
                    }

                    return vRow;
                };

                TetrisGame.prototype.inputDirection = function (direction) {
                    var self = this;
                    var p = self._fallingNumberPosition;

                    if (self._fallingNumber != null) {
                        if (direction === 0 /* Left */) {
                            var pNext = { iRow: p.iRow, iCol: p.iCol - 1 };
                            if (pNext.iCol > 0) {
                                var nextSpot = self.board.rows[pNext.iRow].values[pNext.iCol];
                                if (!nextSpot.isHeading && !nextSpot.isAnswered) {
                                    self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("");
                                    self._fallingNumberPosition = pNext;
                                    self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("" + self._fallingNumber);
                                }
                            }
                        } else if (direction === 1 /* Right */) {
                            var pNext = { iRow: p.iRow, iCol: p.iCol + 1 };
                            if (pNext.iCol > 0) {
                                var nextSpot = self.board.rows[pNext.iRow].values[pNext.iCol];
                                if (!nextSpot.isHeading && !nextSpot.isAnswered) {
                                    self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("");
                                    self._fallingNumberPosition = pNext;
                                    self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("" + self._fallingNumber);
                                }
                            }
                        } else if (direction === 2 /* Down */) {
                            // Move down and answer
                            var pNext = self._fallingNumberPosition;
                            var nextSpot = self.board.rows[pNext.iRow].values[pNext.iCol];

                            while (!nextSpot.isHeading && !nextSpot.isAnswered) {
                                pNext = { iRow: pNext.iRow + 1, iCol: pNext.iCol };
                                nextSpot = self.board.rows[pNext.iRow].values[pNext.iCol];
                            }

                            pNext = { iRow: pNext.iRow - 1, iCol: pNext.iCol };

                            //self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("");
                            self._fallingNumberPosition = { iRow: pNext.iRow, iCol: pNext.iCol };

                            //self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("" + self._fallingNumber);
                            //self.answerAtSpot();
                            self.tickLoop();
                        }
                    }
                };

                TetrisGame.prototype.start = function () {
                    this.tickLoop();
                };

                TetrisGame.prototype.tickLoop = function () {
                    var self = this;

                    if (self.tickTimeoutId) {
                        clearTimeout(self.tickTimeoutId);
                    }

                    self.tick();
                    self.tickTimeoutId = setTimeout(function () {
                        self.tickLoop();
                    }, self._tickTime);
                };

                TetrisGame.prototype.answerAtSpot = function () {
                    var self = this;

                    var p = self._fallingNumberPosition;
                    var thisSpot = self.board.rows[p.iRow].values[p.iCol];

                    // If right
                    if (thisSpot.value == self._fallingNumber) {
                        thisSpot.isAnswered = true;
                        thisSpot.text("" + self._fallingNumber);

                        self._viewModel.changeScore(10, thisSpot.id);
                    } else {
                        self._viewModel.changeScore(-5, thisSpot.id);
                    }

                    self._fallingNumber = null;
                    self._fallingNumberPosition = null;

                    // Check for cleared lines
                    self.clearLines();

                    // Immediately start a new number
                    self.tick();
                };

                TetrisGame.prototype.clearLines = function () {
                    var self = this;

                    var iRow = self.board.rows.length - 2;

                    for (var iCol = 1; iCol < self.board.rows[0].values.length; iCol++) {
                        if (!self.board.rows[iRow].values[iCol].isAnswered) {
                            return;
                        }
                    }

                    // Remove the row
                    self.board.rows.splice(iRow, 1);

                    // Add a new row on top
                    self.board.rows.unshift(TetrisGame.createRow(self._minColumnValue, self._maxColumnValue, self.board.rows[0].values[0].value + 1, self._isAddition));

                    self._viewModel.board.valueHasMutated();
                };

                TetrisGame.prototype.tick = function () {
                    var self = this;

                    for (var iRow = 0; iRow < self.board.rows.length; iRow++) {
                        for (var iCol = 0; iCol < self.board.rows[iRow].values.length; iCol++) {
                            var v = self.board.rows[iRow].values[iCol];

                            if (!v.isHeading) {
                                if (v.isAnswered) {
                                    v.text("" + v.value);
                                } else {
                                    v.text("");
                                }
                            }
                        }
                    }

                    // If no number is falling, show next number
                    if (self._fallingNumber == null) {
                        var nValue = self.getNextValue();
                        self._fallingNumber = nValue;
                        self._fallingNumberPosition = { iRow: 0, iCol: Math.ceil(self.board.rows[0].values.length / 2) };
                    } else {
                        var p = self._fallingNumberPosition;

                        var nextSpot = self.board.rows[p.iRow + 1].values[p.iCol];

                        // If at bottom, then answer
                        if (nextSpot.isAnswered || nextSpot.isHeading) {
                            self.answerAtSpot();
                        } else {
                            self._fallingNumberPosition = { iRow: p.iRow + 1, iCol: p.iCol };
                        }
                    }

                    // Show falling value
                    if (self._fallingNumber != null) {
                        self.board.rows[self._fallingNumberPosition.iRow].values[self._fallingNumberPosition.iCol].text("" + self._fallingNumber);
                    }
                };

                TetrisGame.prototype.getNextValue = function () {
                    var self = this;

                    var rCol = Math.floor(Math.random() * self.board.rows[0].values.length - 1);

                    var iCol = rCol + 1;

                    for (var iRow = self.board.rows.length - 1; iRow > 0; iRow--) {
                        var v = self.board.rows[iRow].values[iCol];

                        if (!v.isHeading && !v.isAnswered) {
                            return v.value;
                        }
                    }
                };
                return TetrisGame;
            })();
            UI.TetrisGame = TetrisGame;
        })(TableMath.UI || (TableMath.UI = {}));
        var UI = TableMath.UI;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
