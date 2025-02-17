import { ABCToNumber } from '@univer/core';
import { FORMULA_AST_NODE_REGISTRY } from '../Basics/Registry';
import { BaseAstNodeFactory, BaseAstNode } from './BaseAstNode';
import { NodeType } from './NodeType';
import { REFERENCE_SINGLE_RANGE_REGEX, REFERENCE_REGEX_SINGLE_ROW, REFERENCE_REGEX_SINGLE_COLUMN, $SUPER_TABLE_COLUMN_REGEX } from '../Basics/Regex';
import { ParserDataLoader } from '../Basics/ParserDataLoader';
import { LexerNode } from '../Analysis/LexerNode';
import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { SheetDataType, IInterpreterCalculateProps } from '../Basics/Common';
import { CellReferenceObject } from '../ReferenceObject/CellReferenceObject';
import { RowReferenceObject } from '../ReferenceObject/RowReferenceObject';
import { ColumnReferenceObject } from '../ReferenceObject/ColumnReferenceObject';
import { TableReferenceObject } from '../ReferenceObject/TableReferenceObject';
import { LexerTreeMaker } from '../Analysis/Lexer';
import { ErrorNode } from './ErrorNode';
import { ErrorType } from '../Basics/ErrorType';

export class ReferenceNode extends BaseAstNode {
    get nodeType() {
        return NodeType.REFERENCE;
    }
    constructor(private _operatorString: string, private _referenceObject: BaseReferenceObject) {
        super();
    }

    execute(interpreterCalculateProps: IInterpreterCalculateProps) {
        const props = interpreterCalculateProps;

        this._referenceObject.setSheetData(props.sheetData);
        this._referenceObject.setDefaultSheetId(props.currentSheetId);
        this._referenceObject.setForcedSheetId(props.sheetNameMap);
        this._referenceObject.setRowCount(props.rowCount);
        this._referenceObject.setColumnCount(props.columnCount);

        this.setValue(this._referenceObject);
    }
}

export class ReferenceNodeFactory extends BaseAstNodeFactory {
    get zIndex() {
        return 1;
    }

    checkAndCreateNodeType(param: LexerNode | string, parserDataLoader: ParserDataLoader) {
        if (param instanceof LexerNode) {
            return false;
        }

        const tokenTrim = param.trim();
        // if (new RegExp(REFERENCE_MULTIPLE_RANGE_REGEX).test(tokenTrim)) {
        //     return true;
        // }

        if (new RegExp(REFERENCE_SINGLE_RANGE_REGEX).test(tokenTrim)) {
            return new ReferenceNode(tokenTrim, new CellReferenceObject(tokenTrim));
        }

        if (new RegExp(REFERENCE_REGEX_SINGLE_ROW).test(tokenTrim)) {
            return new ReferenceNode(tokenTrim, new RowReferenceObject(tokenTrim));
        }

        if (new RegExp(REFERENCE_REGEX_SINGLE_COLUMN).test(tokenTrim)) {
            return new ReferenceNode(tokenTrim, new ColumnReferenceObject(tokenTrim));
        }

        const nameMap = parserDataLoader.getDefinedNameMap();

        if (nameMap.has(tokenTrim)) {
            const nameString = nameMap.get(tokenTrim)!;
            const lexerTreeMaker = new LexerTreeMaker(nameString);
            const lexerNode = lexerTreeMaker.treeMaker();
            lexerTreeMaker.suffixExpressionHandler(lexerNode);
            /** todo */
            return new ErrorNode(ErrorType.VALUE);
        }

        // parserDataLoader.get

        const tableMap = parserDataLoader.getTableMap();
        const $regex = $SUPER_TABLE_COLUMN_REGEX;
        const tableName = tokenTrim.replace($regex, '');
        if (tableMap.has(tableName)) {
            const columnResult = $regex.exec(tokenTrim);
            let columnDataString = '';
            if (columnResult) {
                columnDataString = columnResult[0];
            }
            const tableData = tableMap.get(tableName)!;
            const tableOption = parserDataLoader.getTableOptionMap();
            return new ReferenceNode(tokenTrim, new TableReferenceObject(tokenTrim, tableData, columnDataString, tableOption));
        }

        return false;
    }
}

FORMULA_AST_NODE_REGISTRY.add(new ReferenceNodeFactory());
