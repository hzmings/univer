/**
 * @jest-environment jsdom
 */
import { Context } from '../../src/Basics';
import { CommandManager, SetWorkSheetStatusAction } from '../../src/Command';
import { ACTION_NAMES } from '../../src/Const';
import { WorkBook, WorkSheet } from '../../src/Sheets/Domain';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Set WorkSheet Status', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<WorkBook>('WorkBook');

    const sheetId = 'sheet1';
    const status = 1;
    const worksheet = new WorkSheet(context, { id: sheetId, status });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = ACTION_NAMES.SET_WORKSHEET_STATUS_ACTION;
    const newStatus = 0;
    const configure = {
        actionName,
        sheetId,
        sheetStatus: newStatus,
    };
    const action = new SetWorkSheetStatusAction(configure, workbook, observers);
    expect(worksheet.getStatus()).toEqual(0);

    action.undo();
    expect(worksheet.getStatus()).toEqual(1);
    action.redo();
    expect(worksheet.getStatus()).toEqual(0);
});
