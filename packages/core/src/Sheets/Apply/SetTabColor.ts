import { WorkSheet } from '../Domain/WorkSheet';
import { Nullable } from '../../Shared/Types';

/**
 *
 * @param worksheet
 * @param color
 * @returns
 *
 * @internal
 */
export function SetTabColor(
    worksheet: WorkSheet,
    color: Nullable<string>
): Nullable<string> {
    // get config
    const config = worksheet.getConfig();

    // store old tab color
    const oldTabColor = config.tabColor;

    // set new tab color
    config.tabColor = color!;

    // return old color to undo
    return oldTabColor;
}
