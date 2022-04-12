import * as utils from "../modules/utils.js";
import * as gestures from "../modules/gestures.js";
import * as keys from "../modules/keys.js";

import { Entity } from "./entity.js";
import { Board } from "./board.js";

// NOTE: board interactions overide all keybindings

// constants
const ZOOM_INTENSITY = 0.05,
    INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
    INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
    INERTIAL_DROP_OFF = 5, // in milliseconds
    EPSILON = 0.001; // replacement for 0 to prevent divide-by-zero errors

// state management
let trackedBoard: Board = null,
    selected: Entity[],
    isPanning: boolean,
    isResizing: boolean,
    isMoving: boolean,
    lastPanTime: number,
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
    lastPanTime = 0;
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
    // log gesture event
    let emoji = (e.detail.type === "mouse") ? "🖱️" : "👉";
    utils.log(`${emoji} ${e.detail.name}`, { color: "grey" });
}


const pan = () => { }
const zoom = () => { }
const select = () => { }
const resizeSelection = () => { }
const moveSelection = () => { }
