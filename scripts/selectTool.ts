import { Board, Tool } from "./board.js";
import { Layer } from "./layer.js";
import { Entity } from "./entity.js";
import { Note } from "./note.js";

import * as keys from "../modules/keys.js";
import * as gestures from "../modules/gestures.js";

// constants
const ZOOM_INTENSITY = 0.2,
    INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
    INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
    INERTIA_TIMEOUT = 30, // ms
    EPSILON = 0.01; // replacement for 0 to prevent divide-by-zero errors

// state management
let activeBoard: Board = null,
    activeLayer: Layer = null,
    selected: Entity[] = [],
    handleBounds: { left: number, top: number, w: number, h: number } = null,
    selectBoxBounds: { left: number, top: number, w: number, h: number } = null,
    isPanning = false,
    lastPanTime = 0,
    vx = 0,
    vy = 0;

// define handles entity
let handles = new Entity(0, 0, 0, 0);
handles.render = (board: Board) => {
    if (!handleBounds) return;

    // draw selection box
    board.ctx.save();
    board.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    board.ctx.lineWidth = 3;
    board.ctx.strokeRect(handleBounds.left, handleBounds.top, handleBounds.w, handleBounds.h);
    board.ctx.restore();
}

// define selectBox entity
let selectBox = new Entity(0, 0, 0, 0);
selectBox.render = (board: Board) => {
    if (!selectBoxBounds) return;

    // draw selection box
    board.ctx.save();
    board.ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    board.ctx.lineWidth = 3;
    board.ctx.strokeRect(selectBoxBounds.left, selectBoxBounds.top, selectBoxBounds.w, selectBoxBounds.h);
    board.ctx.restore();
}

const enable = (board: Board, layer: Layer): void => {
    // reset state
    activeBoard = board;
    activeLayer = layer;
    selected = [];
    isPanning = false;
    vx = 0;
    vy = 0;

    // add gesture event listeners
    gestures.enable(activeBoard.canvas);
    activeBoard.canvas.addEventListener("gesture", gestureHandler);

    // setup keybindings
    setupKeybindings();

    // add UI entities
    activeBoard.add(handles);
    activeBoard.add(selectBox);
}

const disable = (): void => {
    if (activeBoard) {
        // remove gesture event listeners
        gestures.disable(activeBoard.canvas);
        activeBoard.canvas.removeEventListener("gesture", gestureHandler);

        // remove keybindings
        keys.unbind("Control+r, Control+R, Meta+r, Meta+R, Control+a, Control+A, Meta+a, Meta+A");

        // remove UI entities
        activeBoard.destroy(handles);
        activeBoard.destroy(selectBox);
    }
}

export const selectTool: Tool = {
    name: "select",
    enable,
    disable
}

const setupKeybindings = () => {
    // Prevent reloading the page
    keys.bind("Control+r, Control+R, Meta+r, Meta+R", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Prevented reload.")
    });

    // Select all entities
    keys.bind("Control+a, Control+A, Meta+a, Meta+A", (e) => {
        // TODO: select all entities
        console.log("TODO: select all entities");
    });
}

const gestureHandler = (e: CustomEvent): void => {
    if (!activeLayer || !activeBoard) return;

    // convert window coordinates to board coordinates
    let scaleFactor = window.devicePixelRatio / activeBoard.scale;
    let x = (e.detail.x - activeBoard.left) * scaleFactor + activeBoard.origin.x,
        y = (e.detail.y - activeBoard.top) * scaleFactor + activeBoard.origin.y,
        dx = (e.detail.dx) ? e.detail.dx * scaleFactor : 0,
        dy = (e.detail.dy) ? e.detail.dy * scaleFactor : 0,
        zoom = e.detail.zoom || 1,
        event = e.detail.event || null;

    // triage gestures by name
    switch (e.detail.name) {
        case "left-click":
        case "tap":
            if (!keys.down["Shift"]) clearSelection();
            select(x, y);
            break;

        case "longclick":
            activeBoard.canvas.style.cursor = "grabbing";
            break;
        
        case "longclick-release":
            activeBoard.canvas.style.cursor = "";
            break;

        case "longclick-dragging":
        case "touch-dragging":
        case "middle-click-dragging":
            activeBoard.canvas.style.cursor = "grabbing";
            pan(dx, dy);
            break;

        case "pinching":
            activeBoard.zoom(x, y, zoom);
            pan(dx, dy);
            break;

        case "wheel":
            activeBoard.zoom(x, y, wheelToZoomFactor(event));
            break;

        case "longclick-drag-end":
        case "middle-click-drag-end":
        case "touch-drag-end":
        case "pinch-end":
            activeBoard.canvas.style.cursor = "";
            endPanning();
            break;

        case "longpress-dragging":
        case "left-click-dragging":
        case "right-click-dragging":
            drawSelectBox(x, y);
            break;

        case "longpress-drag-end":
        case "left-click-drag-end":
        case "right-click-drag-end":
            endSelectBox(x, y);
            break;
    }
}

const drawSelectBox = (x: number, y: number): void => {
    if (!selectBoxBounds) selectBoxBounds = { left: x, top: y, w: 0, h: 0 };

    // update selection box bounds
    selectBoxBounds.w = x - selectBoxBounds.left;
    selectBoxBounds.h = y - selectBoxBounds.top;
}
const endSelectBox = (x: number, y: number): void => {
    if (!selectBoxBounds) return;

    // select all entities in selection box
    // TODO

    // reset selection box bounds
    selectBoxBounds = null;
}

const select = (x: number, y: number): void => {
    // check active layer for intersections
    let entity = activeLayer.firstIntersection(x, y);

    // select intersected entity if not already selected
    if (entity && selected.findIndex((e) => e.ID === entity.ID) === -1) {
        selected.push(entity);
        handleBounds = getBounds(selected);
    }

    // break target focus
    if (selected.length == 0) (document.activeElement as HTMLElement).blur();
    else if (entity instanceof Note) { 
        // focus on note if it is selected
        entity.elm.focus();
    }
    
    console.log("Selected:", selected);
}

const clearSelection = () => {
    selected = [];
    handleBounds = null;
}

const getBounds = (entities: Entity[]): { left: number, top: number, w: number, h: number } => {
    if (entities.length === 0) return null;

    let boundingLeft = entities[0].x,
        boundingRight = entities[0].x,
        boundingTop = entities[0].y,
        boundingBottom = entities[0].y;

    for (let entity of entities) {
        let angle = entity.angle % (Math.PI);
        if (angle > Math.PI / 2) angle = Math.PI - angle;

        let halfW = (Math.sin(angle) * entity.h + Math.cos(angle) * entity.w) / 2,
            halfH = (Math.sin(angle) * entity.w + Math.cos(angle) * entity.h) / 2;

        let left = entity.x - halfW,
            right = entity.x + halfW,
            top = entity.y - halfH,
            bottom = entity.y + halfH;

        boundingLeft = Math.min(boundingLeft, left);
        boundingRight = Math.max(boundingRight, right);
        boundingTop = Math.min(boundingTop, top);
        boundingBottom = Math.max(boundingBottom, bottom);
    }

    let width = boundingRight - boundingLeft,
        height = boundingBottom - boundingTop;

    return {
        left: boundingTop,
        top: boundingLeft,
        w: width,
        h: height
    }
}

const wheelToZoomFactor = (e: WheelEvent): number => {
    // normalize wheel direction
    let direction = e.deltaY < 0 ? 1 : -1;

    // calculate zoom factor
    return Math.exp(direction * ZOOM_INTENSITY);
}

const pan = (dx: number, dy: number) => {
    if (!isPanning) {
        isPanning = true;
        vx = 0;
        vy = 0;
    }
    activeBoard.pan(dx, dy);

    // update velocity
    vx = dx * INERTIAL_MEMORY + vx * (1 - INERTIAL_MEMORY);
    vy = dy * INERTIAL_MEMORY + vy * (1 - INERTIAL_MEMORY);
    lastPanTime = performance.now();
}

const endPanning = () => {
    isPanning = false;

    // drop inertia if too much time has passed
    let elapsed = performance.now() - lastPanTime;
    if (elapsed > INERTIA_TIMEOUT) return;

    requestAnimationFrame(inertia);
    function inertia() {
        // stop inertia if new pan starts or velocity is low
        if (isPanning || (Math.abs(vx) < EPSILON && Math.abs(vy) < EPSILON)) return;

        // move board and update velocity
        activeBoard.pan(vx, vy);
        vx *= INERTIAL_FRICTION;
        vy *= INERTIAL_FRICTION;
        requestAnimationFrame(inertia);
    }
}