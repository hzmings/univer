/**
 * @jest-environment jsdom
 */
import { ACTION_NAMES } from '../../../../src';
import { Context } from '../../../../src/Basics';
import { ActionObservers } from '../../../../src/Command';
import { WorkBook, WorkSheet } from '../../../../src/Sheets/Domain';
import { AddNamedRangeAction } from '../../../../src/Module/NamedRange/Action';
import { INamedRange } from '../../../../src/Module/NamedRange/INamedRange';
import { IOCContainerStartUpReady } from '../../../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Add NamedRange Action Test', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<WorkBook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new WorkSheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const rangeData = {
        startRow: 0,
        endRow: 10,
        startColumn: 0,
        endColumn: 10,
    };
    const namedRange: INamedRange = {
        name: 'named range 1',
        namedRangeId: 'named-range-1',
        range: {
            sheetId: 'sheet1',
            rangeData,
        },
    };
    new AddNamedRangeAction(
        {
            sheetId: worksheet.getSheetId(),
            actionName: ACTION_NAMES.ADD_NAMED_RANGE_ACTION,
            namedRange,
        },
        workbook,
        new ActionObservers()
    );
});
