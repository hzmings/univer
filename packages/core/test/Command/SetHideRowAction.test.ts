/**
 * @jest-environment jsdom
 */
import { WorkBook, WorkSheet } from '../../src/Sheets/Domain';
import { Context } from '../../src/Basics';
import {
    CommandManager,
    SetRowHideAction,
    SetRowShowAction,
} from '../../src/Command';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('SetRowHideAction', () => {
    const observers = CommandManager.getActionObservers();
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<WorkBook>('WorkBook');

    const sheetId = 'sheet1';
    const actionName = 'SetRowHideAction';
    const worksheet = new WorkSheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const configure = { actionName, sheetId, rowIndex: 1, rowCount: 1 };
    const action = new SetRowHideAction(configure, workbook, observers);

    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(true);

    action.undo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(false);
    action.redo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(true);

    const actionNameShow = 'SetRowShowAction';
    const configureShow = {
        actionName: actionNameShow,
        sheetId,
        rowIndex: 1,
        rowCount: 1,
    };
    const actionShow = new SetRowShowAction(configureShow, workbook, observers);

    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(false);

    actionShow.undo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(true);
    actionShow.redo();
    expect(worksheet.getRowManager().getRowOrCreate(1).hd).toEqual(false);
});
