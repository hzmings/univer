import { CURSOR_TYPE, IMouseEvent, IPointerEvent } from '@univer/base-render';
import { SelectionControl } from './SelectionController';

export class SelectionControlFill {
    constructor(private _control: SelectionControl) {
        this._initialize();
    }

    private _initialize() {
        const { fillControl } = this._control;
        const plugin = this._control.getPlugin();
        fillControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            fillControl.cursor = CURSOR_TYPE.CROSSHAIR;
            console.log(CURSOR_TYPE.CROSSHAIR, evt);
        });

        fillControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            fillControl.resetCursor();
            console.log(CURSOR_TYPE.CROSSHAIR, evt);
        });
    }

    static create(control: SelectionControl) {
        return new SelectionControlFill(control);
    }
}
