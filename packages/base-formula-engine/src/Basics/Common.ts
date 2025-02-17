import { BaseReferenceObject } from '../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { AsyncObject } from '../OtherObject/AsyncObject';
import { BooleanNumber, ICellData, IRangeData, Nullable, ObjectMatrix, ObjectMatrixType } from '@univer/core';
import { BaseAstNode } from '../AstNode/BaseAstNode';

export type NodeValueType = BaseValueObject | BaseReferenceObject | ErrorValueObject | AsyncObject;

export type FunctionVariantType = BaseValueObject | BaseReferenceObject | ErrorValueObject;

export type LambdaPrivacyVarType = Map<string, Nullable<BaseAstNode>>;

export type SheetDataType = { [sheetId: string]: ObjectMatrix<ICellData> };

export type CalculateValueType = BaseValueObject | ErrorValueObject;

export interface IFormulaData {
    fs: string; // formulaString
    row: number;
    column: number;
}

export type FormulaDataType = { [sheetId: string]: ObjectMatrixType<IFormulaData> };

export type SheetNameMapType = { [sheetName: string]: string };

export const ERROR_VALUE_OBJECT_CLASS_TYPE = 'errorValueObject';

export const ASYNC_OBJECT_CLASS_TYPE = 'asyncObject';

export const REFERENCE_OBJECT_CLASS_TYPE = 'referenceObject';

export const VALUE_OBJECT_CLASS_TYPE = 'valueObject';

export enum BooleanValue {
    FALSE = 'FALSE',
    TRUE = 'TRUE',
}

export enum AstNodePromiseType {
    SUCCESS,
    ERROR,
}

export enum TableOptionType {
    ALL = '#All',
    DATA = '#Data',
    HEADERS = '#Headers',
    TOTALS = '#Totals',
}

export interface IInterpreterCalculateProps {
    sheetData: SheetDataType;
    formulaData: FormulaDataType;
    sheetNameMap: SheetNameMapType;
    currentRow: number;
    currentColumn: number;
    currentSheetId: string;
    rowCount: number;
    columnCount: number;
}

export interface ISuperTable {
    sheetId: string;
    hasCustomTitle: BooleanNumber;
    titleMap: Map<string, number>;
    rangeData: IRangeData;
}

export interface IArrayValueObject {
    calculateValueList: CalculateValueType[][];
    rowCount: number;
    columnCount: number;
}

export enum ConcatenateType {
    FRONT,
    BACK,
}
