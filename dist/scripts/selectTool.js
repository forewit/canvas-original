import { Entity } from "./entity.js";
import { Note } from "./note.js";
import { Rect } from "../modules/utils.js";
import * as keys from "../modules/keys.js";
import * as gestures from "../modules/gestures.js";
// constants
const ZOOM_INTENSITY = 0.2, INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
INERTIA_TIMEOUT = 30, // ms
EPSILON = 0.01; // replacement for 0 to prevent divide-by-zero errors
// state management
let activeBoard = null, activeLayer = null, selected = [], isPanning = false, lastPanTime = 0, vx = 0, vy = 0;
// define handles entity
let handles = new Entity(0, 0, 0, 0);
handles.render = (board) => {
    if (!handles.enabled)
        return;
    let ctx = board.ctx;
    // draw selection box
    ctx.save();
    ctx.translate(handles.rect.x, handles.rect.y);
    ctx.rotate(handles.rect.rad);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 3;
    ctx.strokeRect(-handles.rect.halfw, -handles.rect.halfh, handles.rect.w, handles.rect.h);
    ctx.restore();
};
// define selectBox entity
let selectBox = new Entity(0, 0, 0, 0);
selectBox.render = (board) => {
    if (!selectBox.enabled)
        return;
    let ctx = board.ctx;
    // draw selection box
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 3;
    ctx.strokeRect(selectBox.rect.left, selectBox.rect.top, selectBox.rect.w, selectBox.rect.h);
    ctx.restore();
};
const enable = (board, layer) => {
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
    activeBoard.uiLayer.add(handles);
    activeBoard.uiLayer.add(selectBox);
};
const disable = () => {
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
};
export const selectTool = {
    name: "select",
    enable,
    disable
};
const setupKeybindings = () => {
    // Prevent reloading the page
    keys.bind("Control+r, Control+R, Meta+r, Meta+R", (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Prevented reload.");
    });
    // Select all entities
    keys.bind("Control+a, Control+A, Meta+a, Meta+A", (e) => {
        // TODO: select all entities
        console.log("TODO: select all entities");
    });
};
const gestureHandler = (e) => {
    if (!activeLayer || !activeBoard)
        return;
    // convert window coordinates to board coordinates
    let scaleFactor = window.devicePixelRatio / activeBoard.scale;
    let x = (e.detail.x - activeBoard.left) * scaleFactor + activeBoard.origin.x, y = (e.detail.y - activeBoard.top) * scaleFactor + activeBoard.origin.y, dx = (e.detail.dx) ? e.detail.dx * scaleFactor : 0, dy = (e.detail.dy) ? e.detail.dy * scaleFactor : 0, zoom = e.detail.zoom || 1, event = e.detail.event || null;
    // triage gestures by name
    switch (e.detail.name) {
        case "left-click":
        case "tap":
            if (!keys.down["Shift"])
                clearSelection();
            selectPoint(x, y);
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
        case "longclick-drag-start":
        case "left-click-drag-start":
        case "right-click-drag-start":
        case "longpress-drag-start":
            if (!keys.down["Shift"])
                clearSelection();
            startSelectBox(x, y);
            break;
        case "longpress-dragging":
        case "left-click-dragging":
        case "right-click-dragging":
        case "longpress-dragging":
            updateSelectBox(x, y, dx, dy);
            break;
        case "longpress-drag-end":
        case "left-click-drag-end":
        case "right-click-drag-end":
        case "longpress-drag-end":
            endSelectBox();
            break;
    }
};
const startSelectBox = (x, y) => {
    selectBox.rect.x = x;
    selectBox.rect.y = y;
    selectBox.rect.w = 0;
    selectBox.rect.h = 0;
    selectBox.enabled = true;
};
const updateSelectBox = (x, y, dx, dy) => {
    if (dx > 0) {
        // moving right while inside the selection box
        if (x < selectBox.rect.right)
            selectBox.rect.left += dx;
        // moving right while outside the selection box
        else
            selectBox.rect.right += dx;
    }
    else {
        // moving left while inside the selection box
        if (x > selectBox.rect.left)
            selectBox.rect.right += dx;
        // moving left while outside the selection box
        else
            selectBox.rect.left += dx;
    }
    if (dy > 0) {
        // moving down while inside the selection box
        if (y < selectBox.rect.bottom)
            selectBox.rect.top += dy;
        // moving down while outside the selection box
        else
            selectBox.rect.bottom += dy;
    }
    else {
        // moving up while inside the selection box
        if (y > selectBox.rect.top)
            selectBox.rect.bottom += dy;
        // moving up while outside the selection box
        else
            selectBox.rect.top += dy;
    }
    // update width and height
    selectBox.rect.w = selectBox.rect.right - selectBox.rect.left;
    selectBox.rect.h = selectBox.rect.bottom - selectBox.rect.top;
    // outline entities in the selection box
    let entities = activeLayer.rectIntersection(selectBox.rect);
    for (let entity of activeLayer.entities) {
        entity.outline = (entities.findIndex(e => e.ID === entity.ID) > -1);
    }
};
const endSelectBox = () => {
    // select all entities in selection box
    let entities = activeLayer.rectIntersection(selectBox.rect);
    for (let entity of entities) {
        entity.outline = false;
        if (selected.findIndex(e => e.ID === entity.ID) > -1)
            continue;
        selected.push(entity);
    }
    // reset selection box bounds
    selectBox.enabled = false;
    // update handles
    handles.rect = getBounds(selected);
    handles.enabled = true;
};
const selectPoint = (x, y) => {
    // check active layer for intersections
    let entity = activeLayer.firstIntersection(x, y);
    // select intersected entity if not already selected
    if (entity && selected.findIndex((e) => e.ID === entity.ID) === -1) {
        selected.push(entity);
        handles.rect = getBounds(selected);
        handles.enabled = true;
    }
    // break target focus
    if (selected.length == 0)
        document.activeElement.blur();
    else if (entity instanceof Note) {
        // focus on note if it is selected
        entity.elm.focus();
    }
};
const clearSelection = () => {
    selected = [];
    handles.enabled = false;
};
const getBounds = (entities) => {
    if (entities.length === 0)
        return null;
    let bounds = new Rect(entities[0].rect.x, entities[0].rect.y, entities[0].rect.w, entities[0].rect.h, entities[0].rect.rad);
    // allow a rotated bounding box if there is only one entity
    if (entities.length === 1)
        return bounds;
    // expand bounding box to include all entities
    bounds.rad = 0;
    for (let entity of entities) {
        let angle = entity.rect.rad % (Math.PI);
        if (angle > Math.PI / 2)
            angle = Math.PI - angle;
        let halfW = (Math.sin(angle) * entity.rect.h + Math.cos(angle) * entity.rect.w) / 2, halfH = (Math.sin(angle) * entity.rect.w + Math.cos(angle) * entity.rect.h) / 2;
        let left = entity.rect.x - halfW, right = entity.rect.x + halfW, top = entity.rect.y - halfH, bottom = entity.rect.y + halfH;
        bounds.left = Math.min(bounds.left, left);
        bounds.right = Math.max(bounds.right, right);
        bounds.top = Math.min(bounds.top, top);
        bounds.bottom = Math.max(bounds.bottom, bottom);
    }
    return bounds;
};
const wheelToZoomFactor = (e) => {
    // normalize wheel direction
    let direction = e.deltaY < 0 ? 1 : -1;
    // calculate zoom factor
    return Math.exp(direction * ZOOM_INTENSITY);
};
const pan = (dx, dy) => {
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
};
const endPanning = () => {
    isPanning = false;
    // drop inertia if too much time has passed
    let elapsed = performance.now() - lastPanTime;
    if (elapsed > INERTIA_TIMEOUT)
        return;
    requestAnimationFrame(inertia);
    function inertia() {
        // stop inertia if new pan starts or velocity is low
        if (isPanning || (Math.abs(vx) < EPSILON && Math.abs(vy) < EPSILON))
            return;
        // move board and update velocity
        activeBoard.pan(vx, vy);
        vx *= INERTIAL_FRICTION;
        vy *= INERTIAL_FRICTION;
        requestAnimationFrame(inertia);
    }
};
