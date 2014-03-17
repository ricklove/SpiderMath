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
    }
}