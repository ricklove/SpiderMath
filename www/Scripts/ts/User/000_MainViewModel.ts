/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Support/AccessProviders.ts" />
/// <reference path="_Model.ts" />
/// <reference path="TetrisGame.ts" />
/// <reference path="Levels.ts" />

module Told.TableMath.UI {

    export class MainViewModel {

        public providers: Data.IProviders;

        constructor(providers?: Data.IProviders) {

            if (providers == null) {
                providers = TableMath.Data.createDefaultProviders();
            }

            this.providers = providers;

            var self = this;

            self._levelIndex = 0;
            self.setupGame();
        }

        game: Game.IGame;
        board = ko.observable<IBoardUI>(null);

        //gameOverStars = ko.observable<boolean[]>([false, false, false]);
        gameOverStarsClass = ko.observable<string>("");
        gameOverHasWon = ko.observable<boolean>(false);
        isGameOver = ko.observable<boolean>(false);
        isPaused = ko.observable<boolean>(false);

        pause(shouldPause: boolean) {
            var self = this;
            self.game.pause(shouldPause);
            self.isPaused(self.game.isPaused);

            console.log("Pause=" + self.isPaused());
        }

        shouldDisplayGameMenu = ko.observable<boolean>(false);
        shouldDisplayGameOver = ko.computed<boolean>(() => { return this.isGameOver() && !this.shouldDisplayGameMenu(); }, this);
        shouldDisplayGame = ko.computed<boolean>(() => { return !this.isGameOver() && !this.shouldDisplayGameMenu(); }, this);

        menu = ko.observable<IMenu>({
            shouldDisplayWorlds: ko.observable<boolean>(true),
            shouldDisplayLevels: ko.observable<boolean>(false),
            shouldDisplayUsers: ko.observable<boolean>(false),

            worlds: ko.observable<IMenuWorld[]>([]),
            levelsById: {},

            currentWorld: ko.observable<IMenuWorld>(null),
            currentUser: ko.observable<string>(""),
            users: ko.observable<IMenuUser[]>([]),
        });

        menuChooseWorld(world: IMenuWorld) {

            if (world.isLocked()) {
                return;
            }

            var self = <MainViewModel>window['mainViewModel'];

            self.menu().currentWorld(world);

            self.menu().shouldDisplayWorlds(false);
            self.menu().shouldDisplayLevels(true);
            self.menu().shouldDisplayUsers(false);

        }

        menuChooseLevel(level: IMenuLevel) {

            if (level.isLocked()) {
                return;
            }

            var self = <MainViewModel>window['mainViewModel'];


            var lIndex = -1;

            self._levels.forEach((l, index) => { if (l.id === level.levelId) { lIndex = index; } });

            self._levelIndex = lIndex;

            self.shouldDisplayGameMenu(false);
            self.setupGame();
        }

        menuChooseUser(user: IMenuUser) {

            if (user.isEditing()) { return; }

            console.log("menuChooseUser");

            var self = <MainViewModel>window['mainViewModel'];
            self.providers.userSettings.currentUserName = user.user();
            //self.menu().currentUser(user.user());

            //self.populateMenu();

            // Reset menu for new user
            self.showMenu();
        }

        menuEditUser_Change(user: IMenuUser, e: Event) {
            var newValue: string = e.currentTarget['value'];

            console.log("user.userEditText changed:" + newValue);

            var self = <MainViewModel>window['mainViewModel'];

            var uList = self.providers.userSettings.userList;

            if (user.isAddUser()) {
                user.isAddUser(false);
                uList.push(newValue);
            } else {
                var iUser = user.index;
                uList[iUser] = newValue;
            }

            self.providers.userSettings.userList = uList;

            user.user(newValue);
            user.isEditing(false);

            self.menuChooseUser(user);
        }

        menuEditUser(user: IMenuUser) {
            console.log("menuEditUser");

            user.isEditing(true);
        }

        menuAddUser(user: IMenuUser) {
            console.log("menuAddUser");

            var self = <MainViewModel>window['mainViewModel'];

            self.menu().users().push({
                index: self.menu().users().length,
                user: ko.observable<string>("Player"),
                userEditText: ko.observable<string>("Player"),
                isEditing: ko.observable<boolean>(false),
                isAddUser: ko.observable<boolean>(true)
            });

            self.menu().users.valueHasMutated();

            self.menuEditUser(user);
        }

        showMenu() {
            var self = this;
            self.populateMenu();
            self.shouldDisplayGameMenu(true);
            self.menu().shouldDisplayWorlds(true);
            self.menu().shouldDisplayLevels(false);
            self.menu().shouldDisplayUsers(false);

            self.menu.valueHasMutated();
        }

        changeUser() {
            var self = this;
            self.menu().shouldDisplayWorlds(false);
            self.menu().shouldDisplayLevels(false);
            self.menu().shouldDisplayUsers(true);
        }

        changeWorld() {
            var self = this;
            self.menu().shouldDisplayWorlds(true);
            self.menu().shouldDisplayLevels(false);
            self.menu().shouldDisplayUsers(false);
        }

        populateMenu() {
            var self = this;
            var menu = self.menu();
            var worlds = menu.worlds();

            // Populate user info
            menu.currentUser(self.providers.userSettings.currentUserName);
            menu.users(self.providers.userSettings.userList.map((u, index) => {
                return {
                    index: index,
                    user: ko.observable<string>(u),
                    userEditText: ko.observable<string>(u),
                    isEditing: ko.observable<boolean>(false),
                    isAddUser: ko.observable<boolean>(false)
                };
            }));

            menu.users().push({
                index: self.menu().users().length,
                user: ko.observable<string>("Player"),
                userEditText: ko.observable<string>("Player"),
                isEditing: ko.observable<boolean>(false),
                isAddUser: ko.observable<boolean>(true)
            });

            // Populate level definitions
            self._levels.forEach((l) => {

                while (worlds.length < l.world) {
                    worlds.push({
                        isLocked: ko.observable<boolean>(true),
                        worldNumber: ko.observable<number>(worlds.length + 1),
                        levels: ko.observable<IMenuLevel[]>([]),
                        stars: ko.observable<number>(0),
                        maxStars: ko.observable<number>(0)
                    });
                }

                var w = worlds[l.world - 1];

                while (w.levels().length < l.level) {
                    w.levels().push({
                        isLocked: ko.observable<boolean>(true),
                        levelId: l.id,
                        levelNumber: ko.observable<number>(w.levels().length + 1),
                        stars: ko.observable<number>(0),
                        starsClass: ko.observable<string>("star-" + 0),
                    });
                }

                var level = w.levels()[l.level - 1];
                menu.levelsById[l.id] = level;
            });

            // Reset all levels
            worlds.forEach(w=> {
                w.levels().forEach(l=> {
                    l.stars(0);
                    l.starsClass("star-0");
                })
            });

            // Set to level states
            var levelStates = self.providers.userSettings.currentUserState.levels;

            levelStates.forEach((ls) => {
                menu.levelsById[ls.levelID].stars(ls.stars);
                menu.levelsById[ls.levelID].starsClass("star-" + ls.stars);
            });

            // Unlock levels & count world stars
            var lastLevelWasFinished = true;
            var wStars = 0;
            var wMaxStars = 0;

            worlds.forEach(w=> {
                wStars = 0;
                wMaxStars = 0;

                w.isLocked(!lastLevelWasFinished);

                w.levels().forEach(l=> {
                    l.isLocked(!lastLevelWasFinished);

                    if (lastLevelWasFinished) {

                        if (l.stars() === 0) {
                            lastLevelWasFinished = false;
                        }
                    }

                    wStars += l.stars();
                    wMaxStars += 3;

                });

                w.stars(wStars);
                w.maxStars(wMaxStars);
            });
        }

        private _levelIndex = 0;

        world = ko.observable<number>(1);
        //stage = ko.observable<number>(1);
        level = ko.observable<number>(1);

        private _levels = Game.Levels.GetLevels();

        private setupGame() {
            var self = this;

            self._isNewGame = true;

            self.score(0);
            self.isGameOver(false);

            self.game = new Game.TetrisGame(self);
            var size = 5;
            var iLevel = self._levelIndex;
            var levelData = self._levels[iLevel];

            self.world(levelData.world);
            //self.stage(levelData.stage);
            self.level(levelData.level);

            self.game.setup(levelData);
            self.updateBoard();
        }

        public gameOver(hasWon: boolean, mistakes: number) {
            var self = this;

            // Record user state

            // Calculate Stars
            var stars = !hasWon ? 0
                : mistakes === 0 ? 3
                : mistakes <= 2 ? 2
                : 1;

            // Update level score
            var iLevel = self._levelIndex;
            var levelData = self._levels[iLevel];
            var levelId = levelData.id;

            var uState = self.providers.userSettings.currentUserState;
            var mLevelState = uState.levels.filter(l=> l.levelID === levelId);
            if (mLevelState.length > 0) {
                var lState = mLevelState[0];
                if (lState.stars < stars) {
                    lState.stars = stars;
                }
            }
            else {
                uState.levels.push({ levelID: levelId, stars: stars });
            }

            // Save state
            self.providers.userSettings.currentUserState = uState;


            // Reset Game
            self.gameOverHasWon(hasWon);
            //self.gameOverStars(stars >= 3 ? [true, true, true] : stars >= 2 ? [true, true, false] : stars >= 1 ? [true, false, false] : [false, false, false]);
            self.gameOverStarsClass("star-" + stars);
            self.isGameOver(true);


            //if (hasWon) {
            //    // Level up
            //    self._levelIndex++;
            //    self.setupGame();
            //} else {
            //    self.isGameOver(true);
            //}
        }

        public newGame() {
            var self = this;

            self._levelIndex = 0;
            self.setupGame();
        }

        private toBoardPosition(gamePositon: Game.IPosition): Game.IPosition {

            // This supports only cleared lines at the bottom of the game board
            return { iRow: this.game.board.rows.length - 1 - gamePositon.iRow, iCol: gamePositon.iCol + 1 };
        }

        private _isNewGame = true;

        public updateBoard() {

            var self = this;
            var gBoard = self.game.board;

            // Create the board initially
            if (self._isNewGame) {
                self._isNewGame = false;

                var board: IBoardUI = { rows: [] };
                var rows = board.rows;

                // Create the header row
                var headerRow: IBoardRowUI = { cells: [], isVisible: true };

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
                gRowCount = gBoard.rows.filter(r=> !r.isCleared).length;
            }

            var gCellCount = gBoard.rows[0].cells.length;

            if (gRowCount < self.board().rows.length - 1) {
                self.board().rows.splice(0, self.board().rows.length - 1 - gRowCount);
            }

            // Create extra blank rows if needed
            while (gRowCount > self.board().rows.length - 1) {
                var nRow = { cells: <IBoardCellUI[]>[] };
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

                    // Set values
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

        handleLevelNext() {
            console.log("handleLevelNext");

            var self = this;
            if (self.isGameOver()) {
                // Level up
                self._levelIndex++;
                self.setupGame();
            }
        }

        handleLevelMenu() {
            console.log("handleLevelMenu");

            var self = this;
            self.showMenu();
        }

        handleLevelReplay() {
            console.log("handleLevelReplay");

            var self = this;
            if (self.isGameOver()) {
                self.setupGame();
            }
        }


        public keydown(keyCode: number) {
            var self = this;

            if (self.isPaused()) {
                self.pause(false);
                return;
            }

            if (event.keyCode === 32) {
                self.pause(true);
            } else if (event.keyCode === 37) {
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

            var doIsGameActive = function () {
                return viewModel.shouldDisplayGame();

                //if (viewModel.isGameOver()) {
                //    // Allow standard input to click on menu buttons
                //    return false;
                //} else if (viewModel.shouldDisplayGame()) {
                //    // Allow standard input to click on menu buttons
                //    return false;
                //} else {
                //    return true;
                //}
            };

            $(document).keydown(function (e) {
                if (doIsGameActive()) {
                    viewModel.keydown(e.keyCode);
                }
            });

            Hammer(document)
                .on("tap", function (ev) {
                    ev.gesture.preventDefault();

                    if (viewModel.isPaused()) {
                        viewModel.pause(false);
                        return;
                    }

                    if (doIsGameActive()) {

                        // If right side, move right
                        if (ev.gesture.center.pageX > window.innerWidth * 0.8) {
                            viewModel.game.inputDirection(Game.Direction.Right);
                        } else if (ev.gesture.center.pageX < window.innerWidth * 0.2) {
                            // If left side, move left
                            viewModel.game.inputDirection(Game.Direction.Left);
                        } else if (ev.gesture.center.pageY < window.innerHeight * 0.2) {
                            // If top side, pause
                            viewModel.pause(true);
                        } else {
                            // If center, down
                            viewModel.game.inputDirection(Game.Direction.Down);
                        }
                    }
                });

            Hammer(document)
                .on("dragleft dragright dragdown swipeleft swiperight swipedown", function (ev) {
                    ev.gesture.preventDefault();
                    if (ev.type == 'dragleft' || ev.type == 'dragright' || ev.type == 'dragdown') { return; }

                    // handle the swipes
                    if (doIsGameActive()) {
                        if (ev.type == "swipedown") {
                            viewModel.game.inputDirection(Game.Direction.Down);
                        } else if (ev.type == "swipeleft") {
                            viewModel.game.inputDirection(Game.Direction.Left);
                        } else if (ev.type == "swiperight") {
                            viewModel.game.inputDirection(Game.Direction.Right);
                        }

                    }
                });

        }
    };

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
    };

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
            scElement.animate({ fontSize: "+=2em", top: endPosition.top, left: endPosition.left },
                500,
                "swing", () => {
                    //scElement.animate({ opacity: "0" }, 500, () => { scElement.hide(); });
                    scElement.hide();
                });

            // At end make it nothing
            //viewModel.scoreChange("");
        }
    };
    
    // Fast click
    declare var FastButton;
    ko.bindingHandlers["fastclick"] = {

        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            new FastButton(element, function () {
                var f : ()=>void = valueAccessor();
                f.call(bindingContext["$root"], bindingContext["$data"], event);
            });
        }
    };

}