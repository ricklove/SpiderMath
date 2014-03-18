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

            self.game = new Game.TetrisGame(this);
            self.game.setup(1, 5, 1, 5, false);
            self.updateBoard();
        }

        game: Game.IGame;
        board = ko.observable<IBoardUI>(null);

        isGameOver = ko.observable<boolean>(false);

        public gameOver(hasWon: boolean) {
            var self = this;

            self.isGameOver(true);

            setTimeout(function () { self.gameOverInner(hasWon); }, 3000);
        }

        public gameOverInner(hasWon: boolean) {
            var self = this;

            self.score(0);
            self.game = new Game.TetrisGame(this);
            self.game.setup(1, 5, 1, 5, false);
            self.updateBoard();

            self.isGameOver(false);
        }

        private toBoardPosition(gamePositon: Game.IPosition): Game.IPosition {

            // This supports only cleared lines at the bottom of the game board
            return { iRow: this.game.board.rows.length - 1 - gamePositon.iRow, iCol: gamePositon.iCol + 1 };
        }

        public updateBoard() {

            var self = this;
            var gBoard = self.game.board;

            // Create the board initially
            if (self.board() == null) {

                var board: IBoardUI = { rows: [] };
                var rows = board.rows;

                // Create the header row
                var headerRow: IBoardRowUI = { cells: [], isVisible: true };

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
            var gRowCount = gBoard.rows.filter(r=> !r.isCleared).length;
            var gCellCount = gBoard.rows[0].cells.length;

            if (gRowCount < self.board().rows.length - 1) {
                self.board().rows.splice(0, self.board().rows.length - 1 - gRowCount);
            }

            // Create extra blank rows if needed
            while (gRowCount > self.board().rows.length - 1) {
                var nRow = { cells: <IBoardCellUI[]>[] };
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

                    // Set values
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
        }

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

            this.scoreChange.valueHasMutated();

            this.score(this.score() + change);
        }


        public keydown(keyCode: number) {
            var self = this;

            if (event.keyCode === 37) {
                self.game.inputDirection(Game.Direction.Left);
            } else if (event.keyCode === 38) {
                self.game.inputDirection(Game.Direction.Up);
            } else if (event.keyCode === 39) {
                self.game.inputDirection(Game.Direction.Right);
            } else if (event.keyCode === 40) {
                self.game.inputDirection(Game.Direction.Down);
            }
        }
    }

    declare var Hammer;

    ko.bindingHandlers["globalInput"] = <KnockoutBindingHandler>{
        init: function (element, valueAccessor, allBindingsAccessor, viewModel: MainViewModel) {

            var value = ko.utils.unwrapObservable(valueAccessor());

            $(element).keydown(function (e) {
                viewModel.keydown(e.keyCode);
            });

            Hammer(element)
                .on("swipedown", function () {
                    viewModel.game.inputDirection(Game.Direction.Down);
                })
            //.on("dragdown", function () {
            //    viewModel.game.inputDirection(Game.Direction.Down);
            //})

                .on("swipeleft", function () {
                    viewModel.game.inputDirection(Game.Direction.Left);
                })
            //.on("dragleft", function () {
            //    viewModel.game.inputDirection(Game.Direction.Left);
            //})

                .on("swiperight", function () {
                    viewModel.game.inputDirection(Game.Direction.Right);
                })
            //.on("dragright", function () {
            //    viewModel.game.inputDirection(Game.Direction.Left);
            //})
            ;
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