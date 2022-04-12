import * as utils from "../modules/utils.js";
import * as gestures from "../modules/gestures.js";
import * as keys from "../modules/keys.js";
// constants
const ZOOM_INTENSITY = 0.05, INERTIAL_FRICTION = 0.8, // 0 = infinite friction, 1 = no friction
INERTIAL_MEMORY = 0.2, // 0 = infinite memory, 1 = no memory
INERTIAL_DROP_OFF = 5, // in milliseconds
EPSILON = 0.001; // replacement for 0 to prevent divide-by-zero errors
// state management
let selected = [], board = null, isPanning = false, isResizing = false, isMoving = false, lastPanTime = 0, vx = 0, vy = 0;
export function interact(board) {
    board = board;
    // setup keyboard shortcuts
    setupKeyboardShortcuts();
    // setup gesture tracking   
    gestures.bind(board.canvas);
    board.canvas.addEventListener("gesture", triageGestures);
}
const setupKeyboardShortcuts = () => {
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
const triageGestures = (e) => {
    // log gesture event
    let emoji = (e.detail.type === "mouse") ? "🖱️" : "👉";
    utils.log(`${emoji} ${e.detail.name}`, { color: "grey" });
};
