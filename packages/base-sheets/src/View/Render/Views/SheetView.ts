import { getColor, Rect, Spreadsheet, SpreadsheetColumnTitle, SpreadsheetRowTitle, SpreadsheetSkeleton } from '@univer/base-render';
import { WorkSheet } from '@univer/core';
import { BaseView, CANVAS_VIEW_KEY, CanvasViewRegistry } from '../BaseView';
import { SelectionManager } from '../../../Controller/Selection/SelectionManager';
import { SelectionModel } from '../../../Model/Domain/SelectionModel';
import { SheetViewKeyboardEvent } from './SheetViewKeyboardEvent';

export enum SHEET_VIEW_KEY {
    MAIN = '__SpreadsheetRender__',
    ROW = '__SpreadsheetRowTitle__',
    COLUMN = '__SpreadsheetColumnTitle__',
    LEFT_TOP = '__SpreadsheetLeftTopPlaceholder__',
}

export class SheetView extends BaseView {
    viewKey = CANVAS_VIEW_KEY.SHEET_VIEW;

    private _selectionManager: SelectionManager;

    private _spreadsheetSkeleton: SpreadsheetSkeleton;

    private _spreadsheet: Spreadsheet;

    private _spreadsheetRowTitle: SpreadsheetRowTitle;

    private _spreadsheetColumnTitle: SpreadsheetColumnTitle;

    private _spreadsheetLeftTopPlaceholder: Rect;

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();
        const workbook = context.getWorkBook();
        let worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            worksheet = workbook.getSheets()[0];
        }
        const spreadsheetSkeleton = this._buildSkeleton(worksheet);

        const { rowTotalHeight, columnTotalWidth, rowTitleWidth, columnTitleHeight } = spreadsheetSkeleton;
        // const rowTitleWidth = rowTitle.hidden !== true ? rowTitle.width : 0;
        // const columnTitleHeight = columnTitle.hidden !== true ? columnTitle.height : 0;
        const spreadsheet = new Spreadsheet(SHEET_VIEW_KEY.MAIN, spreadsheetSkeleton);
        const spreadsheetRowTitle = new SpreadsheetRowTitle(SHEET_VIEW_KEY.ROW, spreadsheetSkeleton);
        const spreadsheetColumnTitle = new SpreadsheetColumnTitle(SHEET_VIEW_KEY.COLUMN, spreadsheetSkeleton);
        const SpreadsheetLeftTopPlaceholder = new Rect(SHEET_VIEW_KEY.LEFT_TOP, {
            zIndex: 2,
            left: -1,
            top: -1,
            width: rowTitleWidth,
            height: columnTitleHeight,
            fill: getColor([248, 249, 250]),
            stroke: getColor([217, 217, 217]),
            strokeWidth: 1,
        });

        this._spreadsheetSkeleton = spreadsheetSkeleton;
        this._spreadsheet = spreadsheet;
        this._spreadsheetRowTitle = spreadsheetRowTitle;
        this._spreadsheetColumnTitle = spreadsheetColumnTitle;
        this._spreadsheetLeftTopPlaceholder = SpreadsheetLeftTopPlaceholder;

        scene.addObjects([spreadsheet], 0);
        scene.addObjects([spreadsheetRowTitle, spreadsheetColumnTitle, SpreadsheetLeftTopPlaceholder], 2);
        scene.transformByState({
            width: this._columnWidthByTitle(worksheet) + columnTotalWidth + 100,
            height: this._rowHeightByTitle(worksheet) + rowTotalHeight + 200,
        });

        this._updateViewport(rowTitleWidth, columnTitleHeight);

        this._selectionManager = new SelectionManager(this);

        // init keyboard event
        new SheetViewKeyboardEvent(scene);
    }

    getSelectionManager() {
        return this._selectionManager;
    }

    getSelectionControls() {
        return this._selectionManager.getCurrentControls();
    }

    getSelectionModels() {
        const controls = this.getSelectionControls();
        if (!controls) {
            return;
        }
        const selectionModels: SelectionModel[] = [];
        for (let control of controls) {
            selectionModels.push(control.model);
        }
        return selectionModels;
    }

    getSpreadsheetSkeleton() {
        return this._spreadsheetSkeleton;
    }

    getSpreadsheet() {
        return this._spreadsheet;
    }

    getSpreadsheetRowTitle() {
        return this._spreadsheetRowTitle;
    }

    getSpreadsheetColumnTitle() {
        return this._spreadsheetColumnTitle;
    }

    getSpreadsheetLeftTopPlaceholder() {
        return this._spreadsheetLeftTopPlaceholder;
    }

    updateToSheet(worksheet: WorkSheet) {
        const scene = this.getScene();
        const spreadsheetSkeleton = this._buildSkeleton(worksheet);
        const { rowTotalHeight, columnTotalWidth, rowTitleWidth, columnTitleHeight } = spreadsheetSkeleton;

        this._spreadsheetSkeleton = spreadsheetSkeleton;
        this._spreadsheet.updateSkeleton(spreadsheetSkeleton);
        this._spreadsheetRowTitle.updateSkeleton(spreadsheetSkeleton);
        this._spreadsheetColumnTitle.updateSkeleton(spreadsheetSkeleton);
        this._spreadsheetLeftTopPlaceholder.transformByState({
            width: rowTitleWidth,
            height: columnTitleHeight,
        });

        scene.transformByState({
            width: this._columnWidthByTitle(worksheet) + columnTotalWidth + 100,
            height: this._rowHeightByTitle(worksheet) + rowTotalHeight + 200,
        });
        this._updateViewport(rowTitleWidth, columnTitleHeight);
        this._selectionManager.updateToSheet(worksheet);
    }

    private _updateViewport(rowTitleWidth: number, columnTitleHeight: number) {
        const scene = this.getScene();
        const rowTitleWidthScale = rowTitleWidth * scene.scaleX;
        const columnTitleHeightScale = columnTitleHeight * scene.scaleY;

        const viewMain = scene.getViewport(CANVAS_VIEW_KEY.VIEW_MAIN);
        const viewTop = scene.getViewport(CANVAS_VIEW_KEY.VIEW_TOP);
        const viewLeft = scene.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT);
        const viewLeftTop = scene.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT_TOP);

        viewMain?.resize({
            left: rowTitleWidthScale,
            top: columnTitleHeightScale,
        });

        viewTop?.resize({
            left: rowTitleWidthScale,
            height: columnTitleHeightScale,
        });

        viewLeft?.resize({
            top: columnTitleHeightScale,
            width: rowTitleWidthScale,
        });

        viewLeftTop?.resize({
            width: rowTitleWidthScale,
            height: columnTitleHeightScale,
        });
    }

    private _buildSkeleton(worksheet: WorkSheet) {
        const context = this.getContext();
        const workbook = context.getWorkBook();
        const config = worksheet.getConfig();
        // const { rowTitle, columnTitle } = config;
        const spreadsheetSkeleton = SpreadsheetSkeleton.create(config, worksheet.getCellMatrix(), workbook.getStyles(), context);

        return spreadsheetSkeleton;
    }

    private _rowHeightByTitle(worksheet: WorkSheet) {
        const config = worksheet?.getConfig();
        const columnTitle = config?.columnTitle.height || 0;
        return columnTitle;
    }

    private _columnWidthByTitle(worksheet: WorkSheet) {
        const config = worksheet?.getConfig();
        const rowTitle = config?.rowTitle.width || 0;
        return rowTitle;
    }
}

CanvasViewRegistry.add(new SheetView());
