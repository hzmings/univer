/**
 * @jest-environment jsdom
 */
import { WorkBook, WorkSheet } from '../../src/Sheets/Domain';
import { Context } from '../../src/Basics';
import { CommandManager, InsertRowAction } from '../../src/Command';
import { IOCContainerStartUpReady } from '../ContainerStartUp';

jest.mock('nanoid', () => ({ nanoid: () => '12345678' }));

test('Undo a new Row', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<WorkBook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new WorkSheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'InsertRowAction';
    const configure = {
        actionName,
        sheetId,
        rowIndex: 0,
        rowCount: 1,
    };
    const action = new InsertRowAction(configure, workbook, observers);
    expect(worksheet.getRowManager().getSize()).toEqual(1);
    action.undo();
    expect(worksheet.getRowManager().getSize()).toEqual(0);
    action.redo();
    expect(worksheet.getRowManager().getSize()).toEqual(1);
});

test('Insert a new Row', () => {
    const container = IOCContainerStartUpReady();
    const context = container.getSingleton<Context>('Context');
    const workbook = container.getSingleton<WorkBook>('WorkBook');

    const sheetId = 'sheet1';
    const worksheet = new WorkSheet(context, { id: sheetId });
    workbook.insertSheet(worksheet);

    const observers = CommandManager.getActionObservers();
    const actionName = 'InsertRowAction';
    const configure = {
        actionName,
        sheetId,
        rowIndex: 0,
        rowCount: 1,
    };
    new InsertRowAction(configure, workbook, observers);
    expect(worksheet.getRowManager().getSize()).toEqual(1);
});
