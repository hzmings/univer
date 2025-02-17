import { RemoveColumn, InsertColumn } from '../Apply';
import { WorkBook } from '../Domain';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { IRemoveColumnAction } from './removeColumnAction';

/**
 * @internal
 */
export interface IInsertColumnActionData extends IActionData {
    columnIndex: number;
    columnCount: number;
}

/**
 * Insert the column configuration of the specified column index
 *
 * @internal
 */
export class InsertColumnAction extends ActionBase<
    IInsertColumnActionData,
    IRemoveColumnAction
> {
    constructor(
        actionData: IInsertColumnActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this.do();
        this._oldActionData = {
            ...actionData,
            convertor: [],
        };
        this.validate();
    }

    do(): void {
        const worksheet = this.getWorkSheet();
        const columnManager = worksheet.getColumnManager();

        InsertColumn(
            this._doActionData.columnIndex,
            this._doActionData.columnCount,
            columnManager.getColumnData().toJSON()
        );

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const columnManager = worksheet.getColumnManager();

        this._observers.notifyObservers({
            type: ActionType.UNDO,
            data: this._oldActionData,
            action: this,
        });

        RemoveColumn(
            this._oldActionData.columnIndex,
            this._oldActionData.columnCount,
            columnManager.getColumnData().toJSON()
        );
    }

    validate(): boolean {
        return false;
    }
}
