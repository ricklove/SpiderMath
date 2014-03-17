/// <reference path="_Model.ts" />
/// <reference path="../Core/Game.ts" />

module Told.TableMath.Game {

    export class TetrisGame implements IGame {

        private _viewModel: UI.MainViewModel;

        public board: IBoard;

        constructor(viewModel: UI.MainViewModel) {
            this._viewModel = viewModel;
        }

        setup(minColumnValue: number, maxColumnValue: number, minRowValue: number, maxRowValue: number, isAddition: boolean= false) {

            var self = this;
            var rows: IBoardRow[] = [];
            var board: IBoard = { rows: rows, minColumnValue: minColumnValue, maxColumnValue: maxColumnValue, columnCount: maxColumnValue - minColumnValue + 1, isAddition: isAddition };

            // Create the value rows
            for (var iRow = minRowValue; iRow <= maxRowValue; iRow++) {
                rows.push(TetrisGame.createRow(minColumnValue, maxColumnValue, iRow, isAddition));
            }

            self.board = board;

            self.start();
        }

        private static createRow(minColumnValue: number, maxColumnValue: number, rowVal: number, isAddition: boolean): IBoardRow {
            var vRow: IBoardRow = { cells: [], value: rowVal, isCleared: false };

            // Create spaces
            for (var iCol = minColumnValue; iCol <= maxColumnValue; iCol++) {

                var val = rowVal * iCol;

                if (isAddition) {
                    val = rowVal + iCol;
                }

                vRow.cells.push({ id: "C_" + rowVal + "_" + iCol, value: val, isAnswered: false });
            }

            return vRow;
        }


        private _tickTime: number = 2000;
        //private _isAddition: boolean;
        //private _minColumnValue: number;
        //private _maxColumnValue: number;
        public fallingNumber: number;
        public fallingNumberPosition: IPosition;


        public inputDirection(direction: Direction) {

            var self = this;
            var p = self.fallingNumberPosition;

            if (self.fallingNumber != null) {

                if (direction === Direction.Left || direction === Direction.Right) {
                    var pNext: IPosition;

                    if (direction === Direction.Left) {
                        pNext = { iRow: p.iRow, iCol: p.iCol - 1 };
                    } else if (direction === Direction.Right) {
                        pNext = { iRow: p.iRow, iCol: p.iCol + 1 };
                    }

                    if (pNext.iCol >= 0 && pNext.iCol < self.board.columnCount) {
                        var nextCell = self.board.rows[pNext.iRow].cells[pNext.iCol];
                        if (!nextCell.isAnswered) {
                            self.fallingNumberPosition = pNext;
                            self._viewModel.updateBoard();
                        }
                    }

                } else if (direction === Direction.Down) {
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
        }

        public start() {
            this.tickLoop();
        }

        tickTimeoutId: number = null;

        private tickLoop() {
            var self = this;

            if (self.tickTimeoutId) {
                clearTimeout(self.tickTimeoutId);
            }

            self.tick();
            self.tickTimeoutId = setTimeout(function () { self.tickLoop(); }, self._tickTime);

            self._tickTime = self._tickTime * 0.99;
        }

        private answerAtSpot() {
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
        }

        private clearLines() {
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

        }

        public tick() {
            var self = this;

            // If no number is falling, show next number
            if (self.fallingNumber == null) {

                var nValue = self.getNextValue();
                self.fallingNumber = nValue;

                self.fallingNumberPosition = { iRow: self.board.rows.length - 1, iCol: Math.floor(self.board.columnCount / 2) };
            }
            // If a number is falling
            else {

                var p = self.fallingNumberPosition;

                // If at bottom, then answer
                if (p.iRow === 0 || self.board.rows[p.iRow - 1].isCleared || self.board.rows[p.iRow - 1].cells[p.iCol].isAnswered) {
                    self.answerAtSpot();
                }
                // If not at bottom then make fall
                else {
                    self.fallingNumberPosition = { iRow: p.iRow - 1, iCol: p.iCol };
                }
            }

            self._viewModel.updateBoard();
        }

        getNextValue(): number {
            var self = this;

            // Keep trying until return
            while (true) {
                var iCol = Math.floor(Math.random() * self.board.columnCount);

                for (var iRow = 0; iRow < self.board.rows.length; iRow++) {

                    var v = self.board.rows[iRow].cells[iCol];

                    if (!v.isAnswered) {
                        return v.value;
                    }
                }
            }
        }

    }

}