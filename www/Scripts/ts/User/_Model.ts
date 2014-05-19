/// <reference path="../../typings/knockout/knockout.d.ts" />
/// <reference path="../Core/Game.ts" />

module Told.TableMath.UI {
    export interface IBoardUI {
        rows: IBoardRowUI[];
    }

    export interface IBoardRowUI {
        cells: IBoardCellUI[];
    }

    export interface IBoardCellUI {
        id: KnockoutObservable<string>;
        text: KnockoutObservable<string>;
        isHeading: boolean;
        cellClassName: KnockoutObservable<string>;
    }

    export interface IMenu {
        worlds: KnockoutObservable<IMenuWorld[]>;
        levelsById: { [id: string]: IMenuLevel };
        shouldDisplayWorlds: KnockoutObservable<boolean>;
        shouldDisplayLevels: KnockoutObservable<boolean>;
        currentUser: KnockoutObservable<string>;
        currentWorld: KnockoutObservable<IMenuWorld>;
    }

    export interface IMenuWorld {
        isLocked: KnockoutObservable<boolean>;
        worldNumber: KnockoutObservable<number>;
        levels: KnockoutObservable<IMenuLevel[]>;
        stars: KnockoutObservable<number>;
        maxStars: KnockoutObservable<number>;

    }

    export interface IMenuLevel {
        isLocked: KnockoutObservable<boolean>;
        levelId: string;
        levelNumber: KnockoutObservable<number>;
        stars: KnockoutObservable<number>;
        starsClass: KnockoutObservable<string>;
    }
}