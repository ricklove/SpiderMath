﻿/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../System/Debug.ts" />
/// <reference path="../System/AdManager.ts" />
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
                    var _this = this;
                    this.board = ko.observable(null);
                    //gameOverStars = ko.observable<boolean[]>([false, false, false]);
                    this.gameOverStarsClass = ko.observable("");
                    this.gameOverHasWon = ko.observable(false);
                    this.isGameOver = ko.observable(false);
                    this.isPaused = ko.observable(false);
                    this.shouldDisplayGameOver_ad = ko.observable(false);
                    this.shouldDisplayGameOver_normal = ko.computed(function () {
                        return !_this.shouldDisplayGameOver_ad();
                    }, this);
                    this.shouldDisplayGameMenu = ko.observable(false);
                    this.shouldDisplayGameOver = ko.computed(function () {
                        return _this.isGameOver() && !_this.shouldDisplayGameMenu();
                    }, this);
                    this.shouldDisplayGame = ko.computed(function () {
                        return !_this.isGameOver() && !_this.shouldDisplayGameMenu();
                    }, this);
                    this.menu = ko.observable({
                        shouldDisplayWorlds: ko.observable(true),
                        shouldDisplayLevels: ko.observable(false),
                        shouldDisplayUsers: ko.observable(false),
                        worlds: ko.observable([]),
                        levelsById: {},
                        currentWorld: ko.observable(null),
                        currentUser: ko.observable(""),
                        users: ko.observable([])
                    });
                    this._levelIndex = 0;
                    this.world = ko.observable(1);
                    //stage = ko.observable<number>(1);
                    this.level = ko.observable(1);
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

                    // Always set up a game to prevent errors
                    self._levelIndex = 0;
                    self.setupGame();

                    if (!self.providers.userSettings.hasModifiedUsers) {
                        if (self.providers.userSettings.currentUserState.levels.length === 0) {
                            // Do nothing else
                        } else {
                            self.showMenu();
                            self.changeWorld();
                        }
                    } else {
                        self.showMenu();
                        self.changeUser();
                    }
                }
                MainViewModel.prototype.pause = function (shouldPause) {
                    var self = this;
                    self.game.pause(shouldPause);
                    self.isPaused(self.game.isPaused);

                    Told.log("Pause", "" + self.isPaused(), true);
                };

                MainViewModel.prototype.showAd = function () {
                    var self = this;
                    self.shouldDisplayGameOver_ad(true);
                    Told.Ads.show(function () {
                        self.shouldDisplayGameOver_ad(false);
                    });
                };

                MainViewModel.prototype.menuChooseWorld = function (world) {
                    if (world.isLocked()) {
                        return;
                    }

                    var self = window['mainViewModel'];

                    self.menu().currentWorld(world);

                    self.menu().shouldDisplayWorlds(false);
                    self.menu().shouldDisplayLevels(true);
                    self.menu().shouldDisplayUsers(false);
                };

                MainViewModel.prototype.menuChooseLevel = function (level) {
                    if (level.isLocked()) {
                        return;
                    }

                    var self = window['mainViewModel'];

                    var lIndex = -1;

                    self._levels.forEach(function (l, index) {
                        if (l.id === level.levelId) {
                            lIndex = index;
                        }
                    });

                    self._levelIndex = lIndex;

                    self.setupGame();
                    self.shouldDisplayGameMenu(false);
                };

                MainViewModel.prototype.menuChooseUser = function (user) {
                    if (user.isEditing()) {
                        return;
                    }

                    Told.log("Menu", "menuChooseUser", true);

                    var self = window['mainViewModel'];
                    self.providers.userSettings.currentUserName = user.user();

                    //self.menu().currentUser(user.user());
                    //self.populateMenu();
                    // Reset menu for new user
                    self.showMenu();
                };

                MainViewModel.prototype.menuEditUser_Change = function (user, e) {
                    var newValue = (e || { currentTarget: {} }).currentTarget['value'];

                    if (user == null) {
                        return;
                    }

                    if (newValue === undefined) {
                        if (!user.isAddUser()) {
                            user.isEditing(false);
                            return;
                        } else {
                            newValue = "Player " + user.index;
                        }
                    }

                    Told.log("User", "userEditText changed", true);
                    Told.log("User", "userEditText changed: '" + newValue + "'", false);

                    var self = window['mainViewModel'];

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
                    //self.menuChooseUser(user);
                };

                MainViewModel.prototype.menuEditUser = function (user) {
                    Told.log("Menu", "menuEditUser", true);

                    var self = window['mainViewModel'];
                    self.menu().users().forEach(function (u, i) {
                        if (i != self.menu().users().length - 1) {
                            self.menuEditUser_Change(u, null);
                        }
                    });

                    user.isEditing(true);
                };

                MainViewModel.prototype.menuAddUser = function (user) {
                    Told.log("Menu", "menuAddUser", true);

                    var self = window['mainViewModel'];

                    self.menu().users().push({
                        index: self.menu().users().length,
                        user: ko.observable("Player"),
                        userEditText: ko.observable("Player"),
                        isEditing: ko.observable(false),
                        isAddUser: ko.observable(true)
                    });

                    self.menu().users.valueHasMutated();

                    self.menuEditUser(user);
                };

                MainViewModel.prototype.showMenu = function () {
                    var self = this;
                    self.populateMenu();
                    self.shouldDisplayGameMenu(true);
                    self.menu().shouldDisplayWorlds(true);
                    self.menu().shouldDisplayLevels(false);
                    self.menu().shouldDisplayUsers(false);

                    self.menu.valueHasMutated();
                };

                MainViewModel.prototype.changeUser = function () {
                    var self = this;
                    self.menu().shouldDisplayWorlds(false);
                    self.menu().shouldDisplayLevels(false);
                    self.menu().shouldDisplayUsers(true);
                };

                MainViewModel.prototype.changeWorld = function () {
                    var self = this;
                    self.menu().shouldDisplayWorlds(true);
                    self.menu().shouldDisplayLevels(false);
                    self.menu().shouldDisplayUsers(false);
                };

                MainViewModel.prototype.populateMenu = function () {
                    var self = this;
                    var menu = self.menu();
                    var worlds = menu.worlds();

                    // Populate user info
                    menu.currentUser(self.providers.userSettings.currentUserName);
                    menu.users(self.providers.userSettings.userList.map(function (u, index) {
                        return {
                            index: index,
                            user: ko.observable(u),
                            userEditText: ko.observable(u),
                            isEditing: ko.observable(false),
                            isAddUser: ko.observable(false)
                        };
                    }));

                    menu.users().push({
                        index: self.menu().users().length,
                        user: ko.observable("Player"),
                        userEditText: ko.observable("Player"),
                        isEditing: ko.observable(false),
                        isAddUser: ko.observable(true)
                    });

                    // Populate level definitions
                    self._levels.forEach(function (l) {
                        while (worlds.length < l.world) {
                            worlds.push({
                                isLocked: ko.observable(true),
                                worldNumber: ko.observable(worlds.length + 1),
                                levels: ko.observable([]),
                                stars: ko.observable(0),
                                maxStars: ko.observable(0)
                            });
                        }

                        var w = worlds[l.world - 1];

                        while (w.levels().length < l.level) {
                            w.levels().push({
                                isLocked: ko.observable(true),
                                levelId: l.id,
                                levelNumber: ko.observable(w.levels().length + 1),
                                stars: ko.observable(0),
                                starsClass: ko.observable("star-" + 0)
                            });
                        }

                        var level = w.levels()[l.level - 1];
                        menu.levelsById[l.id] = level;
                    });

                    // Reset all levels
                    worlds.forEach(function (w) {
                        w.levels().forEach(function (l) {
                            l.stars(0);
                            l.starsClass("star-0");
                        });
                    });

                    // Set to level states
                    var levelStates = self.providers.userSettings.currentUserState.levels;

                    levelStates.forEach(function (ls) {
                        menu.levelsById[ls.levelID].stars(ls.stars);
                        menu.levelsById[ls.levelID].starsClass("star-" + ls.stars);
                    });

                    // Unlock levels & count world stars
                    var lastLevelWasFinished = true;
                    var wStars = 0;
                    var wMaxStars = 0;

                    worlds.forEach(function (w) {
                        wStars = 0;
                        wMaxStars = 0;

                        w.isLocked(!lastLevelWasFinished);

                        w.levels().forEach(function (l) {
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
                };

                MainViewModel.prototype.setupGame = function () {
                    var self = this;

                    self._isNewGame = true;

                    self.score(0);
                    self.isGameOver(false);

                    self.game = new Told.TableMath.Game.TetrisGame(self);
                    var size = 5;
                    var iLevel = self._levelIndex;
                    var levelData = self._levels[iLevel];

                    self.world(levelData.world);
                    self.level(levelData.level);

                    self.game.setup(levelData);
                    self.updateBoard();
                };

                MainViewModel.prototype.gameOver = function (hasWon, mistakes) {
                    var self = this;

                    // Record user state
                    // Calculate Stars
                    var stars = !hasWon ? 0 : mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;

                    // Update level score
                    var iLevel = self._levelIndex;
                    var levelData = self._levels[iLevel];
                    var levelId = levelData.id;

                    var uState = self.providers.userSettings.currentUserState;
                    var mLevelState = uState.levels.filter(function (l) {
                        return l.levelID === levelId;
                    });
                    if (mLevelState.length > 0) {
                        var lState = mLevelState[0];
                        if (lState.stars < stars) {
                            lState.stars = stars;
                        }
                    } else {
                        uState.levels.push({ levelID: levelId, stars: stars });
                    }

                    // Save state
                    self.providers.userSettings.currentUserState = uState;

                    // Reset Game
                    self.gameOverHasWon(hasWon);

                    //self.gameOverStars(stars >= 3 ? [true, true, true] : stars >= 2 ? [true, true, false] : stars >= 1 ? [true, false, false] : [false, false, false]);
                    self.gameOverStarsClass("star-" + stars);
                    self.isGameOver(true);

                    self.showAd();
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

                MainViewModel.prototype.handleLevelNext = function () {
                    Told.log("Command", "LevelNext", true);

                    var self = this;

                    if (self.isPaused()) {
                        self.pause(false);
                    }

                    if (self.isGameOver()) {
                        // Level up
                        self._levelIndex++;
                        self.setupGame();
                    }
                };

                MainViewModel.prototype.handleLevelMenu = function () {
                    Told.log("Command", "LevelMenu", true);

                    var self = this;

                    if (self.isPaused()) {
                        self.pause(false);
                    }

                    self.showMenu();
                };

                MainViewModel.prototype.handleLevelReplay = function () {
                    Told.log("Command", "LevelReplay", true);

                    var self = this;

                    if (self.isPaused()) {
                        self.pause(false);
                    }

                    if (!self.isGameOver()) {
                        self.game.stop();
                    }

                    self.setupGame();
                };

                MainViewModel.prototype.handleLevelResume = function () {
                    Told.log("Command", "LevelResume", true);

                    var self = this;

                    if (self.isPaused()) {
                        self.pause(false);
                    }

                    if (self.isGameOver()) {
                        self.setupGame();
                    }
                };

                MainViewModel.prototype.keydown = function (keyCode) {
                    var self = this;

                    if (self.isPaused()) {
                        self.pause(false);
                        return;
                    }

                    if (event.keyCode === 32) {
                        self.pause(true);
                    } else if (event.keyCode === 37) {
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

                    document.onkeydown = function (e) {
                        if (doIsGameActive()) {
                            viewModel.keydown(e.keyCode);
                        }
                    };

                    //            //$(document).keydown(
                    //    function (e) {
                    //if (doIsGameActive()) {
                    //    viewModel.keydown(e.keyCode);
                    //}
                    var upCount = 0;

                    Hammer(document).on("tap", function (ev) {
                        ev.gesture.preventDefault();

                        if (ev.gesture.center.pageY < window.innerHeight * 0.2) {
                            upCount++;

                            Told.log("Logging", "upCount: " + upCount, false);
                        } else if (upCount > 5) {
                            if (ev.gesture.center.pageX > window.innerWidth * 0.8) {
                                Told.log("Logging", "Enabled", false);

                                // Turn on logging
                                Told.enableLogging("log");
                            }
                        } else {
                            upCount = 0;
                            Told.log("Logging", "upCount reset", false);
                        }

                        if (viewModel.isPaused()) {
                            viewModel.pause(false);
                            return;
                        }

                        if (doIsGameActive()) {
                            // If right side, move right
                            if (ev.gesture.center.pageX > window.innerWidth * 0.8) {
                                viewModel.game.inputDirection(1 /* Right */);
                            } else if (ev.gesture.center.pageX < window.innerWidth * 0.2) {
                                // If left side, move left
                                viewModel.game.inputDirection(0 /* Left */);
                            } else if (ev.gesture.center.pageY < window.innerHeight * 0.2) {
                                // If top side, pause
                                viewModel.pause(true);
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
                        if (doIsGameActive()) {
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

            ko.bindingHandlers["animScoreChange"] = {
                init: function (element) {
                    element.style.display = "none";
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    Told.log("Animation", "slideUpAndFadeOut Update:" + element.id, false);

                    ko.utils.unwrapObservable(valueAccessor()); // to subscribe

                    if (viewModel.scoreChange() == "") {
                        return;
                    }

                    var atElement = document.getElementById(viewModel.scoreChangeAtId());

                    if (atElement == null) {
                        return;
                    }

                    var sPos = atElement.getBoundingClientRect();

                    var startPositionLeft = sPos.left;
                    var startPositionTop = sPos.top;

                    //var startPositionLeft = atElement.offsetLeft;
                    //var startPositionTop = atElement.offsetTop;
                    var endPositionLeft = startPositionLeft;
                    var endPositionTop = startPositionTop - 100;

                    var duration = 500;

                    var changeLeft = endPositionLeft - startPositionLeft;
                    var changeTop = endPositionTop - startPositionTop;

                    var startFontSize = 2;
                    var endFontSize = 4;
                    var changeFontSize = endFontSize - startFontSize;

                    var scoreElement = element;

                    var startTime = Date.now();
                    var updatePosition = function () {
                        var timeChange = Date.now() - startTime;
                        var ratioChange = timeChange / duration;

                        if (ratioChange > 1) {
                            ratioChange = 1;
                        }

                        scoreElement.style.display = "block";

                        scoreElement.style.left = startPositionLeft + (ratioChange * changeLeft) + "px";
                        scoreElement.style.top = startPositionTop + (ratioChange * changeTop) + "px";

                        scoreElement.style.fontSize = (startFontSize + (ratioChange * changeFontSize)) + "em";

                        if (ratioChange < 1) {
                            setTimeout(updatePosition, 10);
                        } else {
                            scoreElement.style.display = "none";
                        }
                    };

                    updatePosition();
                    //// Use jQuery animation
                    //var atElement = $("#" + viewModel.scoreChangeAtId());
                    //if (atElement.length === 0) {
                    //    return;
                    //}
                    //var startPosition = atElement.offset();
                    //// Go to score
                    ////var endPosition = $("#score").offset();
                    //// Go up
                    //var endPosition = startPosition;
                    //endPosition = { left: endPosition.left, top: endPosition.top - 100 };
                    //var scElement = $(element);
                    //scElement.stop(true, true);
                    //scElement.css({ fontSize: "2em", opacity: "100", top: startPosition.top, left: startPosition.left });
                    ////scElement.offset(startPosition);
                    //scElement.show();
                    //scElement.animate({ fontSize: "+=2em", top: endPosition.top, left: endPosition.left },
                    //    500,
                    //    "swing", () => {
                    //        //scElement.animate({ opacity: "0" }, 500, () => { scElement.hide(); });
                    //        scElement.hide();
                    //    });
                    //// At end make it nothing
                    ////viewModel.scoreChange("");
                }
            };

            
            ko.bindingHandlers["fastclick"] = {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    new FastButton(element, function () {
                        var f = valueAccessor();
                        f.call(bindingContext["$root"], bindingContext["$data"], event);
                    });
                }
            };
        })(TableMath.UI || (TableMath.UI = {}));
        var UI = TableMath.UI;
    })(Told.TableMath || (Told.TableMath = {}));
    var TableMath = Told.TableMath;
})(Told || (Told = {}));
