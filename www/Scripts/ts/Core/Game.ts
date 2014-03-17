module Told.TableMath.Game {

    export interface IGame {
        board: IBoard;
        setup(minColumnValue: number, maxColumnValue: number, minRowValue: number, maxRowValue: number, isAddition?: boolean);
        start();

        fallingNumber: number;
        fallingNumberPosition: IPosition;

        inputDirection(direction: Direction);
    }

    export interface IBoard {
        rows: IBoardRow[];
        minColumnValue: number;
        maxColumnValue: number;
        columnCount: number;
        isAddition: boolean;
    }

    export interface IBoardRow {
        cells: IBoardCell[];
        value: number;

        isCleared: boolean;
    }

    export interface IBoardCell {
        id: string;
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
}