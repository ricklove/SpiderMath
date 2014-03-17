/// <reference path="_Model.ts" />
/// <reference path="../Core/Game.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (Game) {
            var TetrisGame = (function () {
                function TetrisGame(viewModel) {
                    this._tickTime = 2000;
                    this.tickTimeoutId = null;
                    this._viewModel = viewModel;
                }
                TetrisGame.prototype.setup = function (minColumnValue, maxColumnValue, minRowValue, maxRowValue, isAddition) {
                    if (typeof isAddition === "undefined") { isAddition = false; }
                    var self = this;
                    var rows = [];
                    var board = { rows: rows, minColumnValue: minColumnValue, maxColumnValue: maxColumnValue, columnCount: maxColumnValue - minColumnValue + 1, isAddition: isAddition };

                    for (var iRow = minRowValue; iRow <= maxRowValue; iRow++) {
                        rows.push(TetrisGame.createRow(minColumnValue, maxColumnValue, iRow, isAddition));
                    }

                    self.board = board;

                    self.start();
                };

                TetrisGame.createRow = function (minColumnValue, maxColumnValue, rowVal, isAddition) {
                    var vRow = { cells: [], value: rowVal, isCleared: false };

                    for (var iCol = minColumnValue; iCol <= maxColumnValue; iCol++) {
                        var val = rowVal * iCol;

                        if (isAddition) {
                            val = rowVal + iCol;
                        }

                        vRow.cells.push({ id: "C_" + rowVal + "_" + iCol, value: val, isAnswered: false });
                    }

                    return vRow;
                };

                TetrisGame.prototype.inputDirection = function (direction) {
                    var self = this;
                    var p = self.fallingNumberPosition;

                    if (self.fallingNumber != null) {
                        if (direction === 0 /* Left */ || direction === 1 /* Right */) {
                            var pNext;

                            if (direction === 0 /* Left */) {
                                pNext = { iRow: p.iRow, iCol: p.iCol - 1 };
                            } else if (direction === 1 /* Right */) {
                                pNext = { iRow: p.iRow, iCol: p.iCol + 1 };
                            }

                            if (pNext.iCol >= 0 && pNext.iCol < self.board.columnCount) {
                                var nextCell = self.board.rows[pNext.iRow].cells[pNext.iCol];
                                if (!nextCell.isAnswered) {
                                    self.fallingNumberPosition = pNext;
                                    self._viewModel.updateBoard();
                                }
                            }
                        } else if (direction === 2 /* Down */) {
                            // Move down and answer
                            var pNext = self.fallingNumberPosition;
                            var nextCell = self.board.rows[pNext.iRow].cells[pNext.iCol];

                            while (!nextCell.isAnswered && pNext.iRow > 0) {
                                pNext = { iRow: pNext.iRow - 1, iCol: pNext.iCol };
                                nextCell = self.board.rows[pNext.iRow].cells[pNext.iCol];
                            }

                            if (nextCell.isAnswered) {
                                pNext = { iRow: pNext.iRow + 1, iCol: pNext.iCol };
                            }

                            self.fallingNumberPosition = { iRow: pNext.iRow, iCol: pNext.iCol };
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

                    self._tickTime = self._tickTime * 0.99;
                };

                TetrisGame.prototype.answerAtSpot = function () {
                    var self = this;

                    var p = self.fallingNumberPosition;
                    var thisCell = self.board.rows[p.iRow].cells[p.iCol];

                    // If right
                    if (thisCell.value == self.fallingNumber) {
                        thisCell.isAnswered = true;
                        self._viewModel.changeScore(10, thisCell.id);
                    } else {
                        self._viewModel.changeScore(-5, thisCell.id);
                    }

                    self.fallingNumber = null;
                    self.fallingNumberPosition = null;

                    // Check for cleared lines
                    self.clearLines();

                    // Immediately start a new number
                    self.tick();
                };

                TetrisGame.prototype.clearLines = function () {
                    var self = this;

                    var iRow = 0;

                    while (self.board.rows[iRow].isCleared) {
                        iRow++;
                    }

                    for (var iCol = 0; iCol < self.board.rows[0].cells.length; iCol++) {
                        if (!self.board.rows[iRow].cells[iCol].isAnswered) {
                            return;
                        }
                    }

                    // Remove the row
                    //self.board.rows.splice(iRow, 1);
                    self.board.rows[iRow].isCleared = true;

                    // Add a new row on top
                    self.board.rows.push(TetrisGame.createRow(self.board.minColumnValue, self.board.maxColumnValue, self.board.rows[self.board.rows.length - 1].value + 1, self.board.isAddition));

                    self._viewModel.board.valueHasMutated();
                };

                TetrisGame.prototype.tick = function () {
                    var self = this;

                    // If no number is falling, show next number
                    if (self.fallingNumber == null) {
                        var nValue = self.getNextValue();
                        self.fallingNumber = nValue;

                        self.fallingNumberPosition = { iRow: self.board.rows.length - 1, iCol: Math.floor(self.board.columnCount / 2) };
                    } else {
                        var p = self.fallingNumberPosition;

                        // If at bottom, then answer
                        if (p.iRow === 0 || self.board.rows[p.iRow - 1].isCleared || self.board.rows[p.iRow - 1].cells[p.iCol].isAnswered) {
                            self.answerAtSpot();
                        } else {
                            self.fallingNumberPosition = { iRow: p.iRow - 1, iCol: p.iCol };
                        }
                    }

                    self._viewModel.updateBoard();
                };

                TetrisGame.prototype.getNextValue = function () {
                    var self = this;

                    while (true) {
                        var iCol = Math.floor(Math.random() * self.board.columnCount);

                        for (var iRow = 0; iRow < self.board.rows.length; iRow++) {
                            var v = self.board.rows[iRow].cells[iCol];

                            if (!v.isAnswered) {
                                return v.value;
                            }
                        }
                    }
                };
                return TetrisGame;
            })();
            Game.TetrisGame = TetrisGame;
        })(TableMath.Game || (TableMath.Game = {}));
        var Game = TableMath.Game;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
