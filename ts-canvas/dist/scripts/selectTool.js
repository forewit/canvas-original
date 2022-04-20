import { Note } from "./note.js";
import * as keys from "../modules/keys.js";
import * as gestures from "../modules/gestures.js";
// constants
const ZOOM_INTENSITY = 0.2, INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
EPSILON = 0.001; // replacement for 0 to prevent divide-by-zero errors
// state management
let activeBoard = null, activeLayer = null, selected = [], isPanning = false, vx = 0, vy = 0;
const enable = (board, layer) => {
    // reset state
    activeBoard = board;
    activeLayer = layer;
    selected = [];
    isPanning = false;
    vx = 0;
    vy = 0;
    // add gesture event listeners
    gestures.enable(board.canvas);
    board.canvas.addEventListener("gesture", gestureHandler);
    // setup keybindings
    setupKeybindings();
};
const disable = () => {
    // remove gesture event listeners
    if (activeBoard) {
        gestures.disable(activeBoard.canvas);
        activeBoard.canvas.removeEventListener("gesture", gestureHandler);
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
            select(x, y);
            break;
        case "left-click-dragging":
        case "touch-dragging":
        case "middle-click-dragging":
            pan(dx, dy);
            break;
        case "pinching":
            activeBoard.zoom(x, y, zoom);
            pan(dx, dy);
            break;
        case "wheel":
            activeBoard.zoom(x, y, wheelToZoomFactor(event));
            break;
        case "left-click-drag-end":
        case "middle-click-drag-end":
        case "touch-drag-end":
        case "pinch-end":
            endPanning();
            break;
    }
};
const select = (x, y) => {
    // check active layer for intersections
    let entity = activeLayer.firstIntersection(x, y);
    // select intersected entity if not already selected
    if (entity && selected.findIndex((e) => e.ID === entity.ID) === -1) {
        selected.push(entity);
    }
    // break target focus
    if (selected.length == 0)
        document.activeElement.blur();
    else if (entity instanceof Note) {
        // focus on note if it is selected
        entity.elm.focus();
    }
    console.log("Selected:", selected);
};
const clearSelection = () => {
    selected = [];
};
const selectionBounds = () => {
    if (selected.length === 0)
        return null;
    let boundingLeft = selected[0].x, boundingRight = selected[0].x, boundingTop = selected[0].y, boundingBottom = selected[0].y;
    for (let entity of selected) {
        let angle = entity.angle % (Math.PI);
        if (angle > Math.PI / 2)
            angle = Math.PI - angle;
        let halfW = (Math.sin(angle) * entity.h + Math.cos(angle) * entity.w) / 2, halfH = (Math.sin(angle) * entity.w + Math.cos(angle) * entity.h) / 2;
        let left = entity.x - halfW, right = entity.x + halfW, top = entity.y - halfH, bottom = entity.y + halfH;
        boundingLeft = Math.min(boundingLeft, left);
        boundingRight = Math.max(boundingRight, right);
        boundingTop = Math.min(boundingTop, top);
        boundingBottom = Math.max(boundingBottom, bottom);
    }
    let width = boundingRight - boundingLeft, height = boundingBottom - boundingTop;
    return {
        x: boundingLeft + width / 2,
        y: boundingTop + height / 2,
        w: width,
        h: height
    };
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
};
const endPanning = () => {
    isPanning = false;
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
