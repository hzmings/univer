import { EventState, Observable, Observer, sortRules, sortRulesByDesc } from '@univer/core';
import { IKeyboardEvent, IMouseEvent, IPointerEvent, IWheelEvent, Nullable } from './Base/IEvents';

import { requestNewFrame, precisionTo } from './Base/Tools';

import { IBoundRect, Vector2 } from './Base/Vector2';

import { EVENT_TYPE, CURSOR_TYPE, RENDER_CLASS_TYPE } from './Base/Const';

import { ISceneTransformState, ITransformChangeState, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from './Base/Interfaces';

import { Transform } from './Base/Transform';

import { Engine } from './Engine';

import { BaseObject } from './BaseObject';

import { Viewport } from './Viewport';

import { Layer } from './Layer';

import { InputManager } from './Scene.inputManager';

import { SceneViewer } from './SceneViewer';

export class Scene {
    // private _ObjectsForward = new Array<BaseObject>();

    // private _ObjectsBack = new Array<BaseObject>();

    private _layers: Layer[] = [];

    private _sceneKey: string = '';

    private _viewports: Viewport[] = [];

    private _width: number = 100;

    private _height: number = 100;

    private _scaleX: number = 1;

    private _scaleY: number = 1;

    private _transform = new Transform();

    private _isFirstDirty: boolean = true;

    private _maxZIndex: 0;

    private _evented = true;

    private _cursor: CURSOR_TYPE = CURSOR_TYPE.DEFAULT;

    /** @hidden */
    private _inputManager: InputManager;

    constructor(sceneKey: string, private _parent: Engine | SceneViewer, state?: ISceneTransformState) {
        this._sceneKey = sceneKey;

        if (state) {
            this.transformByState(state);
        }

        if (this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            const parent = this._parent as Engine;
            parent.addScene(this);
            if (parent.hasActiveScene()) {
                parent.setActiveScene(sceneKey);
            }
            this._inputManager = new InputManager(this);
        } else if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            // 挂载到sceneViewer的scene需要响应前者的transform
            const parent = this._parent as SceneViewer;
            parent.addObject(this);
        }
        this._parent?.onTransformChangeObservable.add((change: ITransformChangeState) => {
            this._resetViewportSize();
            this._setTransForm();
        });

        // setTimeout(() => {
        //     document.querySelector('body')?.appendChild(this.getAllObjects()[0]._cacheCanvas._canvasEle);
        // }, 500);
    }

    attachControl(hasDown: boolean = true, hasUp: boolean = true, hasMove: boolean = true, hasWheel: boolean = true) {
        if (!(this._parent.classType === RENDER_CLASS_TYPE.ENGINE)) {
            // 只绑定直接与engine挂载的scene来统一管理事件
            return;
        }

        this._inputManager?.attachControl(hasDown, hasUp, hasMove, hasWheel);
        return this;
    }

    detachControl() {
        this._inputManager?.detachControl();
        return this;
    }

    makeDirty(state: boolean = true) {
        this._viewports.forEach((vp) => {
            vp.makeDirty(state);
        });
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.makeDirty(state);
        }
        return this;
    }

    makeDirtyNoParent(state: boolean = true) {
        this._viewports.forEach((vp) => {
            vp.makeDirty(state);
        });
        return this;
    }

    isDirty(): boolean {
        for (let i = 0; i < this._viewports.length; i++) {
            const vp = this._viewports[i];
            if (vp.isDirty() === true) {
                return true;
            }
        }
        return false;
    }

    get cursor() {
        return this._cursor;
    }

    set cursor(val: CURSOR_TYPE) {
        this.setCursor(val);
    }

    resetCursor() {
        this.setCursor(CURSOR_TYPE.DEFAULT);
    }

    setCursor(val: CURSOR_TYPE) {
        this._cursor = val;
        const engine = this.getEngine();
        if (!engine) {
            return;
        }
        const canvasEl = engine.getCanvas().getCanvasEle();
        canvasEl.style.cursor = val;
    }

    get classType() {
        return RENDER_CLASS_TYPE.SCENE;
    }

    get transform() {
        return this._transform;
    }

    set transform(trans: Transform) {
        this._transform = trans;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    get scaleX() {
        return this._scaleX;
    }

    get scaleY() {
        return this._scaleY;
    }

    get ancestorScaleX() {
        const p = this.getParent();
        let pScale = 1;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pScale = (p as SceneViewer).ancestorScaleX;
        }
        return this._scaleX * pScale;
    }

    get ancestorScaleY() {
        const p = this.getParent();
        let pScale = 1;
        if (p.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            pScale = (p as SceneViewer).ancestorScaleY;
        }
        return this._scaleY * pScale;
    }

    private set width(num: number) {
        this._width = num;
    }

    private set height(num: number) {
        this._height = num;
    }

    private set scaleX(scaleX: number) {
        this._scaleX = scaleX;
    }

    private set scaleY(scaleY: number) {
        this._scaleY = scaleY;
    }

    resize(width?: number, height?: number) {
        if (width !== undefined) {
            this.width = width;
        }

        if (height !== undefined) {
            this.height = height;
        }

        this._setTransForm();
        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize,
            value: {
                width: this.width,
                height: this.height,
            },
        });
        return this;
    }

    scale(scaleX?: number, scaleY?: number) {
        if (scaleX !== undefined) {
            this.scaleX = scaleX;
        }

        if (scaleY !== undefined) {
            this.scaleY = scaleY;
        }

        this._setTransForm();
        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
            value: {
                scaleX: this.scaleX,
                scaleY: this.scaleY,
            },
        });
        return this;
    }

    scaleBy(scaleX?: number, scaleY?: number) {
        if (scaleX !== undefined) {
            this.scaleX += scaleX;
        }

        if (scaleY !== undefined) {
            this.scaleY += scaleY;
        }

        this.scaleX = precisionTo(this.scaleX, 1);
        this.scaleY = precisionTo(this.scaleY, 1);

        this._setTransForm();
        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
            value: {
                scaleX: this.scaleX,
                scaleY: this.scaleY,
            },
        });
        return this;
    }

    transformByState(state: ISceneTransformState) {
        const optionKeys = Object.keys(state);
        if (optionKeys.length === 0) {
            return;
        }
        optionKeys.forEach((pKey) => {
            if (state[pKey] !== undefined) {
                this[pKey] = state[pKey];
            }
        });

        this._setTransForm();

        this.onTransformChangeObservable.notifyObservers({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.all,
            value: state,
        });
    }

    getParent(): Engine | SceneViewer {
        return this._parent;
    }

    getEngine(): Nullable<Engine> {
        if (this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            return this._parent as Engine;
        }

        let parent: any = this._parent; // type:  SceneViewer | Engine | BaseObject | Scene
        while (parent) {
            if (parent === RENDER_CLASS_TYPE.ENGINE) {
                return parent;
            }
            parent = parent?.getParent();
        }
        return null;
    }

    getLayers() {
        return this._layers;
    }

    getLayer(zIndex: number = 1) {
        for (let layer of this._layers) {
            if (layer.zIndex === zIndex) {
                return layer;
            }
        }
        return this._createDefaultLayer(zIndex);
    }

    private _createDefaultLayer(zIndex: number = 1) {
        const defaultLayer = Layer.create(this, [], zIndex);
        this.addLayer(defaultLayer);
        return defaultLayer;
    }

    getLayerMaxZIndex(): number {
        let maxIndex = Number.MIN_VALUE;
        for (let i = 0; i < this._layers.length; i++) {
            const layer = this._layers[i];
            if (layer.zIndex >= maxIndex) {
                maxIndex = layer.zIndex;
            }
        }
        return maxIndex;
    }

    addLayer(...argument: Layer[]) {
        this._layers.push(...argument);
    }

    // getBackObjects() {
    //     return [...this._ObjectsBack];
    // }

    // getForwardObjects() {
    //     return [...this._ObjectsForward];
    // }

    addObject(o: BaseObject, zIndex: number = 1) {
        this.getLayer(zIndex)?.addObject(o);
        return this;
    }

    // addObjectForward(o: BaseObject) {
    //     this._ObjectsForward.push(o);
    //     this._setObjectBehavior(o);
    //     return this;
    // }

    // addObjectBack(o: BaseObject) {
    //     this._ObjectsBack.push(o);
    //     this._setObjectBehavior(o);
    //     return this;
    // }

    setObjectBehavior(o: BaseObject) {
        if (!o.parent) {
            o.parent = this;
        }
        this.onTransformChangeObservable.add((state: ITransformChangeState) => {
            o.scaleCacheCanvas();
        });
        o.onIsAddedToParentObserver.notifyObservers(this);
    }

    addObjects(objects: BaseObject[], zIndex: number = 1) {
        this.getLayer(zIndex)?.addObjects(objects);
        return this;
    }

    removeObject(object: BaseObject | string) {
        const layers = this.getLayers();
        for (let layer of layers) {
            layer.removeObject(object);
        }
        return this;
    }

    // addBackObjects(...argument: BaseObject[]) {
    //     argument.forEach((o: BaseObject) => {
    //         this.addObjectBack(o);
    //     });
    //     return this;
    // }

    // addForwardObjects(...argument: BaseObject[]) {
    //     argument.forEach((o: BaseObject) => {
    //         this.addObjectForward(o);
    //     });
    //     return this;
    // }

    getAllObjects() {
        const objects: BaseObject[] = [];
        this._layers.sort(sortRules);
        for (let layer of this._layers) {
            objects.push(...layer.getObjectsByOrder());
        }
        return objects;
    }

    getAllObjectsByOrder(isDesc: boolean = false) {
        const objects: BaseObject[] = [];
        const useSortRules = isDesc ? sortRulesByDesc : sortRules;
        this._layers.sort(useSortRules);
        for (let layer of this._layers) {
            objects.push(...layer.getObjectsByOrder().sort(useSortRules));
        }
        return objects;
    }

    getAllObjectsByOrderForPick(isDesc: boolean = false) {
        const objects: BaseObject[] = [];
        const useSortRules = isDesc ? sortRulesByDesc : sortRules;
        this._layers.sort(useSortRules);
        for (let layer of this._layers) {
            objects.push(...layer.getObjectsByOrderForPick().sort(useSortRules));
        }
        return objects;
    }

    getObject(oKey: string) {
        for (let layer of this._layers) {
            const objects = layer.getObjectsByOrder();
            for (let object of objects) {
                if (object.oKey === oKey) {
                    return object;
                }
            }
        }
    }

    addViewport(...viewport: Viewport[]) {
        this._viewports.push(...viewport);
        return this;
    }

    removeViewport() {}

    getViewports() {
        return this._viewports;
    }

    getViewport(key: string) {
        for (let viewport of this._viewports) {
            if (viewport.viewPortKey === key) {
                return viewport;
            }
        }
    }

    changeObjectOrder() {}

    get sceneKey() {
        return this._sceneKey;
    }

    async requestRender(parentCtx?: CanvasRenderingContext2D) {
        return new Promise((resolve, reject) => {
            this.render(parentCtx);
            requestNewFrame(resolve);
        });
    }

    renderObjects(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        this.getAllObjectsByOrder().forEach((o) => {
            o.render(ctx, bounds);
        });
        return this;
    }

    render(parentCtx?: CanvasRenderingContext2D) {
        if (!this.isDirty()) {
            return;
        }
        !parentCtx && this.getEngine()?.getCanvas().clear();
        this.getViewports()?.forEach((vp: Viewport) => vp.render(parentCtx));
    }

    private _resetViewportSize() {
        this.getViewports().forEach((vp: Viewport) => {
            vp.resetSize();
        });
    }

    private _setTransForm() {
        const composeResult = Transform.create().composeMatrix({
            scaleX: this.scaleX,
            scaleY: this.scaleY,
        });

        this.transform = composeResult;
        this.getViewports().forEach((vp: Viewport) => {
            vp.resizeScrollBar();
        });
        this.makeDirty(true);
    }

    enableEvent() {
        this._evented = true;
    }

    disableEvent() {
        this._evented = false;
    }

    // Determine the only object selected
    pick(coord: Vector2): Nullable<BaseObject | Scene> {
        const pickedViewport = this._viewports.find((vp) => vp.isHit(coord));
        if (!this._evented || !pickedViewport) {
            return;
        }

        const scrollBarRect = pickedViewport.pickScrollBar(coord);
        if (scrollBarRect) {
            return scrollBarRect;
        }

        const svCoordOrigin = pickedViewport.getRelativeVector(coord);

        let isPickedObject: Nullable<BaseObject | Scene> = null;

        const objectOrder = this.getAllObjectsByOrderForPick().reverse();
        const objectLength = objectOrder.length;

        for (let i = 0; i < objectLength; i++) {
            const o = objectOrder[i];
            if (!o.visible || !o.evented || o.classType === RENDER_CLASS_TYPE.GROUP) {
                continue;
            }
            let svCoord = svCoordOrigin;
            if (o.isInGroup && o.parent.classType === RENDER_CLASS_TYPE.GROUP) {
                const { cumLeft, cumTop } = this._getGroupCumLeftRight(o);
                svCoord = svCoord.clone().add(Vector2.FromArray([-cumLeft, -cumTop]));
            }

            if (o.isHit(svCoord)) {
                if (o.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                    const pickedObject = (o as SceneViewer).pick(svCoord);
                    if (pickedObject) {
                        isPickedObject = pickedObject;
                    } else {
                        isPickedObject = (o as SceneViewer).scene;
                    }
                } else {
                    isPickedObject = o;
                }
                break;
            } else if (o.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
                const pickedObject = (o as SceneViewer).pick(svCoord);
                if (pickedObject) {
                    isPickedObject = pickedObject;
                    break;
                }
            }
        }

        if (!isPickedObject && this._parent.classType === RENDER_CLASS_TYPE.ENGINE) {
            return this;
        }

        return isPickedObject;
    }

    private _getGroupCumLeftRight(object: BaseObject) {
        let parent: any = object.parent;
        let cumLeft = 0;
        let cumTop = 0;
        while (parent.classType === RENDER_CLASS_TYPE.GROUP) {
            const { left, top } = parent;
            cumLeft += left;
            cumTop += top;

            parent = parent.parent;
        }
        return { cumLeft, cumTop };
    }

    onPointerMove: (evt: IPointerEvent | IMouseEvent) => void;

    onPointerDown: (evt: IPointerEvent | IMouseEvent) => void;

    onPointerUp: (evt: IPointerEvent | IMouseEvent) => void;

    onDblclick: (evt: IPointerEvent | IMouseEvent) => void;

    onMouseWheel: (evt: IWheelEvent) => void;

    onPointerDownObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerMoveObserver = new Observable<IPointerEvent | IMouseEvent>();

    onPointerUpObserver = new Observable<IPointerEvent | IMouseEvent>();

    onDblclickObserver = new Observable<IPointerEvent | IMouseEvent>();

    onMouseWheelObserver = new Observable<IWheelEvent>();

    onKeyDownObservable = new Observable<IKeyboardEvent>();

    onKeyUpObservable = new Observable<IKeyboardEvent>();

    on(eventType: EVENT_TYPE, func: (evt: unknown, state: EventState) => void) {
        const observable = this[`on${eventType}Observer`] as Observable<unknown>;
        const observer = observable.add(func.bind(this));
        return observer;
    }

    off(eventType: EVENT_TYPE, observer: Nullable<Observer<unknown>>) {
        const observable = this[`on${eventType}Observer`] as Observable<unknown>;
        observable.remove(observer);
    }

    remove(eventType: EVENT_TYPE) {
        const observable = this[`on${eventType}Observer`] as Observable<unknown>;
        observable.clear();
    }

    triggerKeyDown(evt: IKeyboardEvent) {
        this.onKeyDownObservable.notifyObservers(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyDown(evt);
        // }
    }

    triggerKeyUp(evt: IKeyboardEvent) {
        this.onKeyUpObservable.notifyObservers(evt);
        // if (this._parent instanceof SceneViewer) {
        //     this._parent?.triggerKeyUp(evt);
        // }
    }

    triggerPointerUp(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerUpObserver.notifyObservers(evt)?.stopPropagation && this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerUp(evt);
        }
    }

    triggerMouseWheel(evt: IWheelEvent) {
        if (!this.onMouseWheelObserver.notifyObservers(evt)?.stopPropagation && this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerMouseWheel(evt);
        }
    }

    triggerPointerMove(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerMoveObserver.notifyObservers(evt)?.stopPropagation && this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerMove(evt);
        }
    }

    triggerDblclick(evt: IPointerEvent | IMouseEvent) {
        if (!this.onDblclickObserver.notifyObservers(evt)?.stopPropagation && this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerDblclick(evt);
        }
    }

    triggerPointerDown(evt: IPointerEvent | IMouseEvent) {
        if (!this.onPointerDownObserver.notifyObservers(evt)?.stopPropagation && this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerDown(evt);
        }
    }

    triggerPointerOut(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerOutObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerOut(evt);
        }
    }

    triggerPointerLeave(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerLeaveObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerLeave(evt);
        }
    }

    triggerPointerOver(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerOverObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerOver(evt);
        }
    }

    triggerPointerEnter(evt: IPointerEvent | IMouseEvent) {
        // this.onPointerEnterObserver.notifyObservers(evt);
        if (this._parent.classType === RENDER_CLASS_TYPE.SCENE_VIEWER) {
            (this._parent as SceneViewer)?.triggerPointerEnter(evt);
        }
    }

    onTransformChangeObservable = new Observable<ITransformChangeState>();
}
