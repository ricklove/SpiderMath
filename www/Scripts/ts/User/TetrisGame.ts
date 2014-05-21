/// <reference path="_Model.ts" />
/// <reference path="../Core/Game.ts" />

module Told.TableMath.Game {

    export class TetrisGame implements IGame {

        private _viewModel: UI.MainViewModel;

        public board: IBoard;
        public isPaused: boolean = false;

        constructor(viewModel: UI.MainViewModel) {
            this._viewModel = viewModel;
        }

        pause(shouldPause: boolean) {
            var self = this;
            self.isPaused = shouldPause;
        }

        setup(level: ILevel) {

            var self = this;
            self.mistakes = 0;
            self.isPaused = false;

            var minColumnValue = level.minColumnValue;
            var maxColumnValue = level.maxColumnValue;
            var minRowValue = level.minRowValue;
            var maxRowValue = level.maxRowValue;
            var isAddition = false;

            var rows: IBoardRow[] = [];
            var board: IBoard = { rows: rows, minColumnValue: minColumnValue, maxColumnValue: maxColumnValue, columnCount: maxColumnValue - minColumnValue + 1, isAddition: isAddition };

            // Create the value rows
            for (var iRow = minRowValue; iRow <= maxRowValue; iRow++) {
                rows.push(TetrisGame.createRow(minColumnValue, maxColumnValue, iRow, isAddition));
            }

            // Create blank rows
            //for (var i = 0; i < 4; i++) {
            for (var i = 0; i < 3; i++) {
                rows.push(TetrisGame.createSpecialRow(minColumnValue, maxColumnValue, "B" + i, true, false));
            }

            self.board = board;

            self.start();
        }

        private static createSpecialRow(minColumnValue: number, maxColumnValue: number, rowId: string, isBlank: boolean, isSolid: boolean): IBoardRow {
            var vRow: IBoardRow = { cells: [], value: 0, isCleared: false, isSpecial: true, isBlank: isBlank, isSolid: isSolid };

            // Create spaces
            for (var iCol = minColumnValue; iCol <= maxColumnValue; iCol++) {
                vRow.cells.push({ id: "C_" + rowId + "_" + iCol, value: 0, isAnswered: false });
            }

            return vRow;
        }

        private static createRow(minColumnValue: number, maxColumnValue: number, rowVal: number, isAddition: boolean): IBoardRow {
            var vRow: IBoardRow = { cells: [], value: rowVal, isCleared: false, isSpecial: false, isBlank: false, isSolid: false };

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

        public mistakes = 0;


        public inputDirection(direction: Direction) {

            var self = this;

            if (self.isGameOver) {
                return;
            }

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
                            self.updateBoard();
                        }
                    }

                } else if (direction === Direction.Down) {
                    // Move down and answer
                    var pNext = self.fallingNumberPosition;

                    var iRowBottom = self.getRowIndex_Bottom(pNext.iCol);

                    self.fallingNumberPosition = { iRow: iRowBottom, iCol: pNext.iCol };
                    self.tickLoop();

                }
            }
        }

        public start() {
            this.tickLoop();
        }

        public stop() {
            var self = this;

            self.isPaused = false;
            clearTimeout(self.tickTimeoutId);
            self._viewModel = null;
            self.isGameOver = true;
        }

        isGameOver: boolean = false;
        tickTimeoutId: number = null;

        private gameOver(hasWon: boolean) {
            var self = this;
            self._viewModel.gameOver(hasWon, self.mistakes);
            clearTimeout(self.tickTimeoutId);
            self._viewModel = null;
            self.isGameOver = true;
        }

        private updateBoard() {
            var self = this;

            if (!self.isGameOver) {
                self._viewModel.updateBoard();
            }
        }

        private changeScore(change: number, atId: string) {
            var self = this;

            if (!self.isGameOver) {
                self._viewModel.changeScore(change, atId);
            }
        }

        private tickLoop() {
            var self = this;

            if (self.tickTimeoutId) {
                clearTimeout(self.tickTimeoutId);
            }


            if (self.isGameOver) {
                return;
            }

            self.tick();

            self.tickTimeoutId = setTimeout(function () { self.tickLoop(); }, self._tickTime);

            if (!self.isPaused) {
                self._tickTime = self._tickTime * 0.99;
            }
        }

        private answerAtSpot() {
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
        }

        private _solidCount: number = 0;

        private removeBlankRowAndEndGameIfOver() {

            var self = this;

            var lastRow = self.board.rows[self.board.rows.length - 1];
            var lastRowNext = self.board.rows[self.board.rows.length - 2];

            if (lastRow.isBlank && lastRowNext.isBlank) {
                self.board.rows.pop();
            }
            else {
                // Game Over
                self.gameOver(false);
            }
        }

        private addSolidRow() {

            throw new Error("This does not work with other logic");

            var self = this;

            self.board.rows.unshift(TetrisGame.createSpecialRow(self.board.minColumnValue, self.board.maxColumnValue, "S" + self._solidCount, false, true));
            self._solidCount++;
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

            // Clear the row
            self.board.rows[iRow].isCleared = true;


            // Add points
            self.changeScore(100, self.board.rows[iRow].cells[Math.floor(self.board.columnCount / 2)].id);

            // Add a new row on top
            var addRow = false;
            if (addRow) {
                var rowsNonBlank = self.board.rows.filter(r=> !r.isBlank);
                var iRow_Blank = rowsNonBlank.length;
                var lastValue = rowsNonBlank[rowsNonBlank.length - 1].value;

                self.board.rows.splice(iRow_Blank, 0, TetrisGame.createRow(self.board.minColumnValue, self.board.maxColumnValue, lastValue + 1, self.board.isAddition));
            }

            // Trigger update
            self.updateBoard();
        }

        private getRowIndex_Bottom(iCol: number): number {
            var self = this;

            for (var iRow = 0; iRow < self.board.rows.length; iRow++) {

                var thisRow = self.board.rows[iRow];

                if (!thisRow.isSolid && !thisRow.isCleared && !thisRow.cells[iCol].isAnswered) {
                    return iRow;
                }
            }

            // There should always be a blank on top to return by default
            throw new Error("There should be a blank on top");
        }

        public tick() {
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
            }
            // If a number is falling
            else {

                var p = self.fallingNumberPosition;

                // If at bottom, then answer
                var iRowBottom = self.getRowIndex_Bottom(p.iCol);

                // If not at bottom then make fall
                if (p.iRow > iRowBottom) {
                    self.fallingNumberPosition = { iRow: p.iRow - 1, iCol: p.iCol };
                }
                else {
                    self.answerAtSpot();
                }
            }

            self.updateBoard();
        }

        getNextValue(): number {
            var self = this;

            // Keep trying until return
            var nextValues: number[] = [];

            for (var iCol = 0; iCol < self.board.columnCount; iCol++) {
                var iRowBottom = self.getRowIndex_Bottom(iCol);

                if (!self.board.rows[iRowBottom].isBlank) {
                    nextValues.push(self.board.rows[iRowBottom].cells[iCol].value);
                }
            }

            if (nextValues.length === 0) {
                return null;
            }
            else {
                var iValue = Math.floor(Math.random() * nextValues.length);
                return nextValues[iValue];
            }
        }

    }

}