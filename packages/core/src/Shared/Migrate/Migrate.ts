import { nanoid } from 'nanoid';
import {
    IWorkbookConfig,
    IWorksheetConfig,
    ICellData,
    IElementsOrder,
    ITextStyle,
    IStyleData,
} from '../../Interfaces';
import { IKeyValue } from '../Types';
import { border } from './Border';

export function migrate(config: any): Partial<IWorkbookConfig> {
    const newConfig: Partial<IWorkbookConfig> = {};
    newConfig.styles = {};
    if (config.hasOwnProperty('lang')) {
        newConfig.locale = config.lang;
    }
    if (config.hasOwnProperty('data')) {
        newConfig.sheets = {};
        for (let sheet of config.data) {
            const newSheet: Partial<IWorksheetConfig> = {};

            //  id
            if (sheet.hasOwnProperty('index')) {
                newSheet.id = sheet.index as string;
            } else {
                newSheet.id = nanoid(6);
            }

            // 缩放比例
            if (sheet.hasOwnProperty('zoomRatio')) {
                newSheet.zoomRatio = sheet.zoomRatio;
            }

            // 最大行号
            if (sheet.hasOwnProperty('row')) {
                newSheet.rowCount = sheet.row;
            }

            // 最大列号
            if (sheet.hasOwnProperty('column')) {
                newSheet.columnCount = sheet.column;
            }

            // 是否激活
            if (sheet.hasOwnProperty('status')) {
                newSheet.status = sheet.status;
            }

            // sheet 名称
            if (sheet.hasOwnProperty('name')) {
                newSheet.name = sheet.name;
            }

            // 激活选区
            if (sheet.hasOwnProperty('universheet_select_save')) {
                newSheet.selections = [];
                sheet.universheet_select_save.forEach((selection: IKeyValue) => {
                    newSheet.selections?.push({
                        startRow: selection.row[0],
                        endRow: selection.row[1],
                        startColumn: selection.column[0],
                        endColumn: selection.column[1],
                    });
                });
            }

            // 横向滚动条位置
            if (sheet.hasOwnProperty('scrollLeft')) {
                newSheet.scrollLeft = sheet.scrollLeft;
            }

            // 竖向滚动条位置
            if (sheet.hasOwnProperty('scrollTop')) {
                newSheet.scrollTop = sheet.scrollTop;
            }

            if (sheet.hasOwnProperty('config')) {
                // 合并单元格
                if (sheet.config.merge) {
                    newSheet.mergeData = [];
                    for (const key of Object.keys(sheet.config.merge)) {
                        const merge: {
                            r: number;
                            c: number;
                            rs: number;
                            cs: number;
                        } = sheet.config.merge[key];
                        const mergeReact = {
                            startRow: merge.r,
                            endRow: merge.r + merge.rs - 1,
                            startColumn: merge.c,
                            endColumn: merge.c + merge.cs - 1,
                        };
                        newSheet.mergeData.push(mergeReact);
                    }
                }

                // 边框，先按顺序设置到每一个单元格对象中，设置时需要遍历四个方向的相邻单元格做去重，最后单元格样式确定之后，再统一提取到styles上
                if (sheet.config.borderInfo) {
                    border(newSheet, sheet);
                }

                // 行高
                if (sheet.config.rowlen) {
                    newSheet.rowData = {};
                    for (const [rowIndex, height] of Object.entries(
                        sheet.config.rowlen
                    )) {
                        newSheet.rowData[String(rowIndex)] = {
                            h: height,
                            hd: 0,
                        };
                    }
                }
                // 列宽
                if (sheet.config.columnlen) {
                    newSheet.columnData = {};
                    for (const [colIndex, width] of Object.entries(
                        sheet.config.columnlen
                    )) {
                        newSheet.columnData[String(colIndex)] = {
                            w: width,
                            hd: 0,
                        };
                    }
                }
                // 隐藏行
                if (sheet.config.rowhidden) {
                    if (!newSheet.rowData) newSheet.rowData = {};
                    for (const [rowIndex, isHidden] of Object.entries(
                        sheet.config.rowhidden
                    )) {
                        if (!newSheet.rowData[String(rowIndex)]) {
                            newSheet.rowData[String(rowIndex)] = {};
                        }

                        newSheet.rowData[String(rowIndex)].hd = isHidden;
                    }
                }
                // 隐藏列
                if (sheet.config.colhidden) {
                    if (!newSheet.columnData) newSheet.columnData = {};
                    for (const [colIndex, isHidden] of Object.entries(
                        sheet.config.colhidden
                    )) {
                        if (!newSheet.columnData[String(colIndex)]) {
                            newSheet.columnData[String(colIndex)] = {};
                        }
                        newSheet.columnData[String(colIndex)].hd = isHidden;
                    }
                }
            }

            // 单元格数据
            if (sheet.hasOwnProperty('celldata')) {
                if (!newSheet.cellData) {
                    newSheet.cellData = {};
                }

                for (const cellItem of sheet.celldata) {
                    if (!newSheet.cellData[cellItem.r]) {
                        newSheet.cellData[cellItem.r] = {};
                    }
                    if (!newSheet.cellData[cellItem.r][cellItem.c]) {
                        newSheet.cellData[cellItem.r][cellItem.c] = {};
                    }

                    const cell = cellItem.v;

                    const newCell: ICellData =
                        newSheet.cellData[cellItem.r][cellItem.c];

                    if (cell?.ct?.t === 'inlineStr') {
                        const elements = {};
                        const elementOrder: IElementsOrder[] = [];

                        cell.ct.s.forEach((element: any) => {
                            const textStyle: ITextStyle = {};

                            // 背景颜色
                            if (element.hasOwnProperty('bg')) {
                                textStyle.bg = {
                                    rgb: element.fc,
                                };
                            }

                            // 字体
                            if (element.hasOwnProperty('ff')) {
                                textStyle.ff = element.ff;
                            }

                            // 字体颜色
                            if (element.hasOwnProperty('fc')) {
                                textStyle.cl = {
                                    rgb: element.fc,
                                };
                            }

                            // 字体大小
                            if (element.hasOwnProperty('fs')) {
                                textStyle.fs = element.fs;
                            }

                            // 粗体
                            if (element.hasOwnProperty('bl')) {
                                textStyle.bl = element.bl;
                            }

                            // 斜体
                            if (element.hasOwnProperty('it')) {
                                textStyle.it = element.it;
                            }

                            // 删除线
                            if (element.hasOwnProperty('cl')) {
                                textStyle.st = {
                                    s: 1,
                                };
                            }

                            // 下划线
                            if (element.hasOwnProperty('un')) {
                                textStyle.ul = {
                                    s: element.un,
                                };
                            }

                            const eId = nanoid(6);
                            elements[eId] = {
                                eId,
                                st: 0,
                                ed: element.v.length - 1,
                                et: 0,
                                tr: {
                                    ct: element.v,
                                    ts: textStyle,
                                },
                            };

                            elementOrder.push({
                                elementId: eId,
                                paragraphElementType: 0,
                            });
                        });

                        newCell.p = {
                            documentId: nanoid(6),
                            body: {
                                blockElements: {
                                    p1: {
                                        blockId: 'p1',
                                        st: 0,
                                        ed: cell.ct.s.length - 1,
                                        blockType: 0,
                                        paragraph: {
                                            elements,
                                            elementOrder,
                                        },
                                    },
                                },
                                blockElementOrder: ['p1'],
                            },
                            documentStyle: {},
                        };
                    } else {
                        // 原始值
                        if (cell.hasOwnProperty('v')) {
                            newCell.v = cell.v;
                        }

                        // 显示值
                        if (cell.hasOwnProperty('m')) {
                            newCell.m = cell.m;
                        }

                        const cellStyle: IStyleData = {};

                        // 背景颜色
                        if (cell.hasOwnProperty('bg')) {
                            cellStyle.bg = {
                                rgb: cell.bg,
                            };
                        }

                        // 	字体
                        if (cell.hasOwnProperty('ff')) {
                            cellStyle.ff = cell.ff;
                        }

                        // 字体颜色
                        if (cell.hasOwnProperty('fc')) {
                            cellStyle.cl = {
                                rgb: cell.fc,
                            };
                        }

                        // 字体大小
                        if (cell.hasOwnProperty('fs')) {
                            cellStyle.fs = cell.fs;
                        }

                        // 粗体
                        if (cell.hasOwnProperty('bl')) {
                            cellStyle.bl = cell.bl;
                        }

                        // 斜体
                        if (cell.hasOwnProperty('it')) {
                            cellStyle.it = cell.it;
                        }

                        // 删除线
                        if (cell.hasOwnProperty('cl')) {
                            cellStyle.st = {
                                s: cell.cl,
                            };
                        }

                        // 下划线
                        if (cell.hasOwnProperty('un')) {
                            cellStyle.ul = {
                                s: cell.un,
                            };
                        }

                        const sMap = {
                            '0': 2,
                            '1': 1,
                            '2': 3,
                        };

                        // 垂直对齐
                        if (cell.hasOwnProperty('vt')) {
                            cellStyle.vt = sMap[String(cell.vt)];
                        }

                        // 水平对齐
                        if (cell.hasOwnProperty('ht')) {
                            cellStyle.ht = sMap[String(cell.ht)];
                        }

                        // 竖排文字
                        if (cell.hasOwnProperty('tr')) {
                            switch (cell.tr) {
                                case '0':
                                    cellStyle.tr = {
                                        a: 0,
                                        v: 0,
                                    };
                                    break;

                                case '1':
                                    cellStyle.tr = {
                                        a: 45,
                                        v: 0,
                                    };
                                    break;

                                case '2':
                                    cellStyle.tr = {
                                        a: -45,
                                        v: 0,
                                    };
                                    break;

                                case '3':
                                    cellStyle.tr = {
                                        a: 0,
                                        v: 1,
                                    };
                                    break;

                                case '4':
                                    cellStyle.tr = {
                                        a: 90,
                                        v: 0,
                                    };
                                    break;

                                case '5':
                                    cellStyle.tr = {
                                        a: -90,
                                        v: 0,
                                    };
                                    break;

                                default:
                                    break;
                            }
                        }

                        // 文字旋转角度
                        if (cell.hasOwnProperty('rt')) {
                            cellStyle.tr = {
                                a: cell.tr,
                                v: 0,
                            };
                        }

                        // 文本换行
                        if (cell.hasOwnProperty('tb')) {
                            cellStyle.tb = sMap[String(cell.tb)];
                        }

                        newCell.s = Object.assign(newCell.s || {}, cellStyle);
                    }
                }
            }

            newConfig.sheets[newSheet.id] = newSheet;
        }
    }
    return newConfig;
}
