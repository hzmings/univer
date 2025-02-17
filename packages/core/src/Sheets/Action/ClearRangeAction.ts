import { SetRangeData, ClearRange } from '../Apply';
import { ACTION_NAMES } from '../../Const';
import { CONVERTOR_OPERATION } from '../../Const/CONST';
import { WorkSheetConvertor } from '../../Convertor/WorkSheetConvertor';
import { WorkBook } from '../Domain';
import { ICellData, IOptionsData, IRangeData } from '../../Interfaces';
import { ObjectMatrixPrimitiveType } from '../../Shared/ObjectMatrix';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers, ActionType } from '../../Command/ActionObservers';
import { ISetRangeDataActionData } from './SetRangeDataAction';

/**
 * @internal
 */
export interface IClearRangeActionData extends IActionData {
    options: IOptionsData;
    rangeData: IRangeData;
}

/**
 * Clearly specify a range of styles, content, comments, validation, filtering
 *
 * @internal
 */
export class ClearRangeAction extends ActionBase<
    IClearRangeActionData,
    ISetRangeDataActionData,
    ObjectMatrixPrimitiveType<ICellData>
> {
    constructor(
        actionData: IClearRangeActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);

        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            cellValue: this.do(),
            convertor: [],
        };
        this.validate();
    }

    do(): ObjectMatrixPrimitiveType<ICellData> {
        const worksheet = this.getWorkSheet();

        const result = ClearRange(
            worksheet.getCellMatrix(),
            this._doActionData.options,
            this._doActionData.rangeData
        );

        this._observers.notifyObservers({
            type: ActionType.REDO,
            data: this._doActionData,
            action: this,
        });

        return result;
    }

    redo(): void {
        // update pre data
        const { sheetId, rangeData } = this._doActionData;

        this._oldActionData = {
            actionName: ACTION_NAMES.SET_RANGE_DATA_ACTION,
            sheetId,
            rangeData,
            cellValue: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        const { rangeData, cellValue } = this._oldActionData;
        const styles = this._workbook.getStyles();

        if (worksheet) {
            SetRangeData(worksheet.getCellMatrix(), cellValue, rangeData, styles);
            // no need update current data

            this._observers.notifyObservers({
                type: ActionType.UNDO,
                data: this._oldActionData,
                action: this,
            });
        }
    }

    validate(): boolean {
        return false;
    }
}
