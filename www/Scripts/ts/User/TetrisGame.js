/// <reference path="_Model.ts" />
/// <reference path="../Core/Game.ts" />
var Told;
(function (Told) {
    (function (TableMath) {
        (function (Game) {
            var TetrisGame = (function () {
                function TetrisGame(viewModel) {
                    this.isPaused = false;
                    this._tickTime = 2000;
                    this.mistakes = 0;
                    this.isGameOver = false;
                    this.tickTimeoutId = null;
                    this._solidCount = 0;
                    this._viewModel = viewModel;
                }
                TetrisGame.prototype.pause = function (shouldPause) {
                    var self = this;
                    self.isPaused = shouldPause;
                };

                TetrisGame.prototype.setup = function (level) {
                    var self = this;
                    self.mistakes = 0;
                    self.isPaused = false;

                    var minColumnValue = level.minColumnValue;
                    var maxColumnValue = level.maxColumnValue;
                    var minRowValue = level.minRowValue;
                    var maxRowValue = level.maxRowValue;
                    var isAddition = false;

                    var rows = [];
                    var board = { rows: rows, minColumnValue: minColumnValue, maxColumnValue: maxColumnValue, columnCount: maxColumnValue - minColumnValue + 1, isAddition: isAddition };

                    for (var iRow = minRowValue; iRow <= maxRowValue; iRow++) {
                        rows.push(TetrisGame.createRow(minColumnValue, maxColumnValue, iRow, isAddition));
                    }

                    for (var i = 0; i < 3; i++) {
                        rows.push(TetrisGame.createSpecialRow(minColumnValue, maxColumnValue, "B" + i, true, false));
                    }

                    self.board = board;

                    self.start();
                };

                TetrisGame.createSpecialRow = function (minColumnValue, maxColumnValue, rowId, isBlank, isSolid) {
                    var vRow = { cells: [], value: 0, isCleared: false, isSpecial: true, isBlank: isBlank, isSolid: isSolid };

                    for (var iCol = minColumnValue; iCol <= maxColumnValue; iCol++) {
                        vRow.cells.push({ id: "C_" + rowId + "_" + iCol, value: 0, isAnswered: false });
                    }

                    return vRow;
                };

                TetrisGame.createRow = function (minColumnValue, maxColumnValue, rowVal, isAddition) {
                    var vRow = { cells: [], value: rowVal, isCleared: false, isSpecial: false, isBlank: false, isSolid: false };

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

                    if (self.isGameOver) {
                        return;
                    }

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
                                    self.updateBoard();
                                }
                            }
                        } else if (direction === 2 /* Down */) {
                            // Move down and answer
                            var pNext = self.fallingNumberPosition;

                            var iRowBottom = self.getRowIndex_Bottom(pNext.iCol);

                            self.fallingNumberPosition = { iRow: iRowBottom, iCol: pNext.iCol };
                            self.tickLoop();
                        }
                    }
                };

                TetrisGame.prototype.start = function () {
                    this.tickLoop();
                };

                TetrisGame.prototype.stop = function () {
                    var self = this;

                    self.isPaused = false;
                    clearTimeout(self.tickTimeoutId);
                    self._viewModel = null;
                    self.isGameOver = true;
                };

                TetrisGame.prototype.gameOver = function (hasWon) {
                    var self = this;
                    self._viewModel.gameOver(hasWon, self.mistakes);
                    clearTimeout(self.tickTimeoutId);
                    self._viewModel = null;
                    self.isGameOver = true;
                };

                TetrisGame.prototype.updateBoard = function () {
                    var self = this;

                    if (!self.isGameOver) {
                        self._viewModel.updateBoard();
                    }
                };

                TetrisGame.prototype.changeScore = function (change, atId) {
                    var self = this;

                    if (!self.isGameOver) {
                        self._viewModel.changeScore(change, atId);
                    }
                };

                TetrisGame.prototype.tickLoop = function () {
                    var self = this;

                    if (self.tickTimeoutId) {
                        clearTimeout(self.tickTimeoutId);
                    }

                    if (self.isGameOver) {
                        return;
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
                        self.changeScore(10, thisCell.id);
                    } else {
                        self.changeScore(-5, thisCell.id);
                        self.mistakes++;

                        //self.addSolidRow();
                        self.removeBlankRowAndEndGameIfOver();
                    }

                    self.fallingNumber = null;
                    self.fallingNumberPosition = null;

                    // Check for cleared lines
                    self.clearLines();

                    // Immediately start a new number
                    self.tick();
                };

                TetrisGame.prototype.removeBlankRowAndEndGameIfOver = function () {
                    var self = this;

                    var lastRow = self.board.rows[self.board.rows.length - 1];
                    var lastRowNext = self.board.rows[self.board.rows.length - 2];

                    if (lastRow.isBlank && lastRowNext.isBlank) {
                        self.board.rows.pop();
                    } else {
                        // Game Over
                        self.gameOver(false);
                    }
                };

                TetrisGame.prototype.addSolidRow = function () {
                    throw new Error("This does not work with other logic");

                    var self = this;

                    self.board.rows.unshift(TetrisGame.createSpecialRow(self.board.minColumnValue, self.board.maxColumnValue, "S" + self._solidCount, false, true));
                    self._solidCount++;
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

                    // Clear the row
                    self.board.rows[iRow].isCleared = true;

                    // Add points
                    self.changeScore(100, self.board.rows[iRow].cells[Math.floor(self.board.columnCount / 2)].id);

                    // Add a new row on top
                    var addRow = false;
                    if (addRow) {
                        var rowsNonBlank = self.board.rows.filter(function (r) {
                            return !r.isBlank;
                        });
                        var iRow_Blank = rowsNonBlank.length;
                        var lastValue = rowsNonBlank[rowsNonBlank.length - 1].value;

                        self.board.rows.splice(iRow_Blank, 0, TetrisGame.createRow(self.board.minColumnValue, self.board.maxColumnValue, lastValue + 1, self.board.isAddition));
                    }

                    // Trigger update
                    self.updateBoard();
                };

                TetrisGame.prototype.getRowIndex_Bottom = function (iCol) {
                    var self = this;

                    for (var iRow = 0; iRow < self.board.rows.length; iRow++) {
                        var thisRow = self.board.rows[iRow];

                        if (!thisRow.isSolid && !thisRow.isCleared && !thisRow.cells[iCol].isAnswered) {
                            return iRow;
                        }
                    }

                    throw new Error("There should be a blank on top");
                };

                TetrisGame.prototype.tick = function () {
                    var self = this;

                    if (self.isPaused) {
                        return;
                    }

                    if (self.isGameOver) {
                        return;
                    }

                    // If no number is falling, show next number
                    if (self.fallingNumber == null) {
                        var nValue = self.getNextValue();

                        if (nValue === null) {
                            self.gameOver(true);
                            return;
                        }

                        self.fallingNumber = nValue;

                        self.fallingNumberPosition = { iRow: self.board.rows.length - 1, iCol: Math.floor(self.board.columnCount / 2) };
                    } else {
                        var p = self.fallingNumberPosition;

                        // If at bottom, then answer
                        var iRowBottom = self.getRowIndex_Bottom(p.iCol);

                        // If not at bottom then make fall
                        if (p.iRow > iRowBottom) {
                            self.fallingNumberPosition = { iRow: p.iRow - 1, iCol: p.iCol };
                        } else {
                            self.answerAtSpot();
                        }
                    }

                    self.updateBoard();
                };

                TetrisGame.prototype.getNextValue = function () {
                    var self = this;

                    // Keep trying until return
                    var nextValues = [];

                    for (var iCol = 0; iCol < self.board.columnCount; iCol++) {
                        var iRowBottom = self.getRowIndex_Bottom(iCol);

                        if (!self.board.rows[iRowBottom].isBlank) {
                            nextValues.push(self.board.rows[iRowBottom].cells[iCol].value);
                        }
                    }

                    if (nextValues.length === 0) {
                        return null;
                    } else {
                        var iValue = Math.floor(Math.random() * nextValues.length);
                        return nextValues[iValue];
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
