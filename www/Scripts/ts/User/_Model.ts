/// <reference path="../../typings/knockout/knockout.d.ts" />

module Told.TableMath.UI {
    export interface IBoardUI {
        rows: IBoardRowUI[];
    }

    export interface IBoardRowUI {
        values: IBoardValueUI[]
    }

    export interface IBoardValueUI {
        id: string;
        text: KnockoutObservable<string>;
        isHeading: boolean;

        value: number;
        isAnswered: boolean;
    }

    export interface IPosition {
        iRow: number;
        iCol: number;
    }

    export enum Direction {
        Left,
        Right,
        Down,
        Up
    }

    export interface IGameUI {
        board: IBoardUI;
        setup(minColumnValue: number, maxColumnValue: number, minRowValue: number, maxRowValue: number, isAddition?: boolean);
        start();

        inputDirection(direction: Direction);
    }
}