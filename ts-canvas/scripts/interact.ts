import * as utils from "../modules/utils.js";
import * as gestures from "../modules/gestures.js";
import * as keys from "../modules/keys.js";

import { Handles } from "./handles.js";
import { Entity } from "./entity.js";
import { Board } from "./board.js";

// NOTE: board interactions overide all keybindings

// constants
const ZOOM_INTENSITY = 0.2,
    INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
    INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
    EPSILON = 0.001; // replacement for 0 to prevent divide-by-zero errors

// state management
let trackedBoard: Board = null,
    selected: Entity[],
    isPanning: boolean,
    isResizing: boolean,
    isMoving: boolean,
    vx: number,
    vy: number;

export function bind(board: Board): void {
    // reset state
    unbind();

    // set tracked board
    trackedBoard = board;

    // setup keybindings
    setupKeybindings();

    // bind gestures to an element and add event handler
    gestures.bind(trackedBoard.canvas);
    trackedBoard.canvas.addEventListener("gesture", triageGestures);

    // logging
    console.log("Interacting with board...");
}

export function unbind(): void {
    // reset state
    selected = [];
    isPanning = false;
    isResizing = false;
    isMoving = false;
    vx = 0;
    vy = 0;

    // remove keybindings
    keys.unbind();

    if (trackedBoard) {
        // unbind gestures and remove event handler
        gestures.unbind(trackedBoard.canvas);
        trackedBoard.canvas.removeEventListener("gesture", triageGestures);
        trackedBoard = null;

        // logging
        console.log("Stopped interacting with board...");
    }
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

const triageGestures = (e: CustomEvent) => {
    // convert window coordinates to board coordinates
    let scaleFactor = window.devicePixelRatio / trackedBoard.scale;
    let x = (e.detail.x - trackedBoard.left) * scaleFactor + trackedBoard.origin.x,
        y = (e.detail.y - trackedBoard.top) * scaleFactor + trackedBoard.origin.y,
        dx = (e.detail.dx) ? e.detail.dx * scaleFactor : 0,
        dy = (e.detail.dy) ? e.detail.dy * scaleFactor : 0,
        zoom = e.detail.zoom || 1,
        event = e.detail.event || null;

    // triage gestures by name
    switch (e.detail.name) {
        case "left-click-drag-start":
        case "middle-click-drag-start":
        case "touch-drag-start":
        case "pinch-start":
            startPanning();
            break;

        case "left-click-dragging":
        case "touch-dragging":
        case "middle-click-dragging":
            pan(dx, dy);
            break;

        case "pinching":
            trackedBoard.zoomOnPoint(x, y, zoom);
            pan(dx, dy);
            break;
        
        case "wheel":
            trackedBoard.zoomOnPoint(x, y, wheelToZoomFactor(event));
            break;

        case "left-click-drag-end":
        case "middle-click-drag-end":
        case "touch-drag-end":
        case "pinch-end":
            endPanning();
            break;
    }
}


const wheelToZoomFactor = (e: WheelEvent): number => {
    // normalize wheel direction
    let direction = e.deltaY < 0 ? 1 : -1;

    // calculate zoom factor
    return Math.exp(direction * ZOOM_INTENSITY);
}

const startPanning = () => {
    isPanning = true;
    vx = 0;
    vy = 0;
}

const pan = (dx: number, dy: number) => {
    trackedBoard.translate(dx, dy);

    // update velocity
    vx = dx * INERTIAL_MEMORY + vx * (1 - INERTIAL_MEMORY);
    vy = dy * INERTIAL_MEMORY + vy * (1 - INERTIAL_MEMORY);
}

const endPanning = () => {
    isPanning = false;
    requestAnimationFrame(inertia);

    function inertia() {
        // stop inertia if new pan starts or velocity is low
        if (isPanning || (Math.abs(vx) < EPSILON && Math.abs(vy) < EPSILON)) return;

        // move board and update velocity
        trackedBoard.translate(vx, vy);
        vx *= INERTIAL_FRICTION;
        vy *= INERTIAL_FRICTION;
        requestAnimationFrame(inertia);
    }
}