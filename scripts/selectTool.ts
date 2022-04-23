import { Board, Tool } from "./board.js";
import { Layer } from "./layer.js";
import { Entity } from "./entity.js";
import { Note } from "./note.js";
import { Handle } from "./handle.js";
import { SelectBox } from "./selectBox.js";

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
    handle = new Handle(),
    selectBox = new SelectBox(),
    selected: Entity[] = [],
    isPanning = false,
    lastPanTime = 0,
    vx = 0,
    vy = 0;

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
    activeBoard.uiLayer.add(handle);
    activeBoard.uiLayer.add(selectBox);
}

const disable = (): void => {
    if (activeBoard) {
        // remove gesture event listeners
        gestures.disable(activeBoard.canvas);
        activeBoard.canvas.removeEventListener("gesture", gestureHandler);

        // remove keybindings
        keys.unbind("Control+r, Control+R, Meta+r, Meta+R, Control+a, Control+A, Meta+a, Meta+A");

        // remove UI entities
        activeBoard.uiLayer.destroy(handle);
        activeBoard.uiLayer.destroy(selectBox);
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
            selectPoint(x, y);
            break;

        case "right-click-dragging":
        case "touch-dragging":
        case "middle-click-dragging":
            activeBoard.canvas.style.cursor = "grabbing";
            pan(dx, dy);
            break;

        case "right-click-drag-end":
        case "middle-click-drag-end":
        case "touch-drag-end":
            activeBoard.canvas.style.cursor = "";
            endPanning();
            break;

        case "pinching":
            activeBoard.zoom(x, y, zoom);
            pan(dx, dy);
            break;
        
        case "pinch-end":
            endPanning();
            break;

        case "wheel":
            activeBoard.zoom(x, y, wheelToZoomFactor(event));
            break;

        case "longclick":
            activeBoard.canvas.style.cursor = "crosshair";
            break;
        
        case "longclick-release":
            activeBoard.canvas.style.cursor = "";
            break;

        case "longclick-drag-start":
        case "left-click-drag-start":
        case "longpress-drag-start":
            if (!keys.down["Shift"]) clearSelection();
            dragSelectStart(x, y);
            break;

        case "longclick-dragging":
        case "left-click-dragging":
        case "longpress-dragging":
            dragSelect(x, y, dx, dy);
            break;

        case "longclick-drag-end":
        case "left-click-drag-end":
        case "longpress-drag-end":
            endDragSelect();
            break;
    }
}

const dragSelectStart = (x: number, y: number): void => {
    selectBox.reset(x, y);
    selectBox.enabled = true;
}
const dragSelect = (x: number, y: number, dx: number, dy: number): void => {
    selectBox.updateBounds(x, y, dx, dy);

    // outline entities in the selection box
    let entities = activeLayer.rectIntersection(selectBox.rect);
    for (let entity of activeLayer.entities) {
        entity.outline = (entities.findIndex(e => e.ID === entity.ID) > -1)
    }
}

const endDragSelect = (): void => {
    // select all entities in selection box
    let entities = activeLayer.rectIntersection(selectBox.rect);
    for (let entity of entities) {
        entity.outline = false;
        if (selected.findIndex(e => e.ID === entity.ID) > -1) continue;
        selected.push(entity);
    }

    // disable selection box
    selectBox.enabled = false;

    // update and enable handles
    handle.updateBounds(selected);
    handle.enabled = true;
}

const selectPoint = (x: number, y: number): void => {
    // check active layer for intersections
    let entity = activeLayer.firstIntersection(x, y);

    // select intersected entity if not already selected
    if (entity && selected.findIndex((e) => e.ID === entity.ID) === -1) {
        selected.push(entity);
        handle.updateBounds(selected);
        handle.enabled = true;
    }

    // break target focus
    if (selected.length == 0) (document.activeElement as HTMLElement).blur();
    else if (entity instanceof Note) {
        // focus on note if it is selected
        entity.elm.focus();
    }
}

const clearSelection = () => {
    selected = [];
    handle.enabled = false;
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