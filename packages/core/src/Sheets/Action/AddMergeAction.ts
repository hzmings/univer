import { addMerge } from '../Apply/AddMerge';
import { RemoveMerge } from '../Apply/RemoveMerge';
import { CONVERTOR_OPERATION } from '../../Const';
import { WorkSheetConvertor } from '../../Convertor';
import { WorkBook } from '../Domain';
import { IRangeData } from '../../Interfaces';
import { ActionBase, IActionData } from '../../Command/ActionBase';
import { ActionObservers } from '../../Command/ActionObservers';
import { IRemoveMergeActionData } from './RemoveMergeAction';

/**
 * @internal
 * Format of AddMergeActionData param
 */
export interface IAddMergeActionData extends IActionData {
    rectangles: IRangeData[];
}

/**
 * Set merged cell range
 *
 * @internal
 */
export class AddMergeAction extends ActionBase<
    IAddMergeActionData,
    IRemoveMergeActionData,
    IRangeData[]
> {
    constructor(
        actionData: IAddMergeActionData,
        workbook: WorkBook,
        observers: ActionObservers
    ) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.INSERT)],
        };
        this._oldActionData = {
            ...actionData,
            rectangles: this.do(),
            convertor: [new WorkSheetConvertor(CONVERTOR_OPERATION.REMOVE)],
        };
        this.validate();
    }

    redo(): void {
        this.do();
    }

    undo(): void {
        const worksheet = this.getWorkSheet();
        RemoveMerge(worksheet.getMerges(), this._doActionData.rectangles);
    }

    do(): IRangeData[] {
        const worksheet = this.getWorkSheet();
        return addMerge(worksheet.getMerges(), this._doActionData.rectangles);
    }

    validate(): boolean {
        return false;
    }
}
