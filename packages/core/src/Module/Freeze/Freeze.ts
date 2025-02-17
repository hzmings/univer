import { WorkSheet } from '../../Sheets/Domain';
import { Command, CommandManager } from '../../Command';
import { Context } from '../../Basics';
import { ACTION_NAMES } from '../../Const';

export class Freeze {
    private _commandManager: CommandManager;

    private _context: Context;

    private _worksheet: WorkSheet;

    constructor(workSheet: WorkSheet) {
        this._context = workSheet.getContext();
        this._commandManager = this._context.getCommandManager();
        this._worksheet = workSheet;
    }

    setFrozenColumns(columns: number): WorkSheet {
        const { _context, _commandManager } = this;
        const configure = {
            actionName: ACTION_NAMES.SET_FROZEN_COLUMNS_ACTION,
            sheetId: this._worksheet.getSheetId(),
            numColumns: columns,
        };
        const command = new Command(_context.getWorkBook(), configure);
        _commandManager.invoke(command);

        return this._worksheet;
    }

    setCancelFrozen(): void {}

    setFrozenRows(rows: number): WorkSheet {
        const { _context, _commandManager } = this;
        const configure = {
            actionName: ACTION_NAMES.SET_FROZEN_ROWS_ACTION,
            sheetId: this._worksheet.getSheetId(),
            numRows: rows,
        };
        const command = new Command(_context.getWorkBook(), configure);
        _commandManager.invoke(command);

        return this._worksheet;
    }
}
