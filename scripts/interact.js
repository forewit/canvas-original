// TODO: Move all "screeToCanvas" responsibility to the canvas object

import { Entity } from "./entity.js";

// PREFERENCES
let zoomIntensity = 0.05;
let inertiaFriction = 0.8; // 0 = infinite friction, 1 = no friction
let inertiaMemory = 0.2; // 0 = infinite memory, 1 = no memory
let inertiaDropOff = 5 // in milliseconds
let epsilon = 0.001;
let handleSize = 5;

// STATE MANAGEMENT
let selected = [];
let canvas = undefined;
let isPanning = false;
let isResizing = false;
let isMoving = false;
let lastPanTime, lastPoint;
let vx = 0, vy = 0;
let log = document.getElementById('log');
let gestures = {};

// EXPORTS-------------------------------------------
export let interact = {
    setTool: setTool,
    initialize: initialize,
    stop: stop,
};

function setTool(name) {
    gestures.clear();

    // global keyboard shortcuts
    keys.on('17 82', function (e) {
        e.preventDefault();
        console.log('Prevented reload!');
    });

    switch (name) {
        case 'select':
            log.innerHTML = 'Select';

            // touch gestures
            gestures.on('tap', () => {
                console.log('tap');
            });
            gestures.on('double tap', (x, y) => {
                console.log('double tap');
            });
            gestures.on('longPress', (x, y) => {
                console.log('long press');
            });
            gestures.on('touchDragStart', (x, y) => {
                console.log('touch drag start');
                mouseDragStart((x, y));
            });
            gestures.on('touchDragging', (x, y) => {
                console.log('touch dragging');
                mouseDragging((x, y))
            });
            gestures.on('touchDragEnd', () => {
                console.log('touch drag end');
                mouseDragEnd();
            });
            gestures.on('pinchStart', (x, y) => {
                console.log('pinch start');
                mouseDragStart(x, y);
            });
            gestures.on('pinching', (x, y, zoom) => {
                console.log('pinching');
                zoomOnPoint(x, y, zoom);
                panning(x, y);
            });
            gestures.on('pinchEnd', () => {
                console.log('pinch end');
                mouseDragEnd();
            });

            // mouse gestures
            gestures.on('click', (x, y) => {
                console.log('click');

                // clear selection if shift is not being held
                if (!keys.down[16]) clearSelection();

                selectPoint(x, y);
            });
            gestures.on('doubleClick', (x, y) => {
                console.log('double click');
            });
            gestures.on('rightClick', (x, y) => {
                console.log('right click');
            });
            gestures.on('longClick', (x, y) => {
                console.log('long click');
            });
            gestures.on('wheel', (x, y, event) => {
                console.log('wheel');
                wheel(x, y, event);
            });
            gestures.on('mouseDragStart', (x, y) => {
                console.log('mouse drag start');
                mouseDragStart(x, y);
            });
            gestures.on('mouseDragging', (x, y) => {
                console.log('mouse dragging');
                mouseDragging(x, y);
            });
            gestures.on('mouseDragEnd', () => {
                console.log('mouse drag end');
                mouseDragEnd();
            });
            break;

        case 'measure':
            break;

        case 'draw':
            break;

        default:
            console.log('Invalid tool choice!');
            break;
    }
}

// cnvs is a Canvas object, not an element
function initialize(cnvs) {
    canvas = cnvs;
    gestures = new Gestures(canvas.elm)
    gestures.start();
    keys.start()
}
function stop() {
    canvas = undefined;
    gestures.stop();
    keys.stop();
}
// END EXPORTS---------------------------------------



// **************** MOUSE TRIAGE FUNCTIONS ****************
function mouseDragStart(x, y) {
    /** TODO CASES
     * 1. dragging active handle -> resize selection
     * 2. draging active selection -> move selection
     * 3. dragging an unselected entity -> select entity & move selection
     * 4. dragging no entities -> pan
     */
    panStart(x, y);
}
function mouseDragging(x, y) {
    /** TODO CASES
     * 1. resize selection
     * 2. move selection
     * 3. pan
     */
    if (isPanning) {
        panning(x, y);
        return;
    } else if (isResizing) {

    } else if (isMoving) {

    }
}
function mouseDragEnd() {
    if (isPanning) panEnd();
    if (isResizing) resizeEnd();
    if (isMoving) moveEnd();
}
// **************************************************



// **************** PANNING FUNCTIONS ***************
function panStart(x, y) {
    isPanning = true;
    lastPoint = {x: x, y: y};
    vx = 0;
    vy = 0;
}
function panning(x, y) {
    let dx = (x - lastPoint.x) / canvas.scale;
    let dy = (y - lastPoint.y) / canvas.scale;

    vx = dx * inertiaMemory + vx * (1 - inertiaMemory);
    vy = dy * inertiaMemory + vy * (1 - inertiaMemory);

    canvas.originx -= dx;
    canvas.originy -= dy;
    canvas.ctx.translate(dx, dy);

    lastPoint = {x:x, y:y};
    lastPanTime = new Date();
}
function panEnd() {
    isPanning = false;
    let elapsed = new Date() - lastPanTime;

    vx *= Math.min(1, inertiaDropOff / elapsed);
    vy *= Math.min(1, inertiaDropOff / elapsed);
    requestAnimationFrame(panInertia);
}
function panInertia() {
    if (isPanning || (Math.abs(vx) < epsilon && Math.abs(vy) < epsilon)) return;
    requestAnimationFrame(panInertia);

    canvas.originx -= vx;
    canvas.originy -= vy;
    canvas.ctx.translate(vx, vy);

    vx *= inertiaFriction;
    vy *= inertiaFriction;
}
// **************************************************



// **************** ZOOMING FUNCTIONS ***************
function wheel(x, y, event) {
    let delta = event.deltaY;

    // Normalize wheel to +1 or -1.
    let wheel = delta < 0 ? 1 : -1;

    // Compute zoom factor.
    let zoom = Math.exp(wheel * zoomIntensity);

    // zoom
    zoomOnPoint(x, y, zoom);
}
function zoomOnPoint(x, y, zoom) {
    // Translate so the visible origin is at the context's origin.
    canvas.ctx.translate(canvas.originx, canvas.originy);

    // Compute the new visible origin. Originally the mouse is at a
    // distance mouse/scale from the corner, we want the point under
    // the mouse to remain in the same place after the zoom, but this
    // is at mouse/new_scale away from the corner. Therefore we need to
    // shift the origin (coordinates of the corner) to account for this.
    canvas.originx -= x * canvas.dpi / (canvas.scale * zoom) - x * canvas.dpi / canvas.scale;
    canvas.originy -= y * canvas.dpi / (canvas.scale * zoom) - y * canvas.dpi / canvas.scale;

    // Scale it (centered around the origin due to the trasnslate above).
    canvas.ctx.scale(zoom, zoom);
    // Offset the visible origin to it's proper position.
    canvas.ctx.translate(-canvas.originx, -canvas.originy);

    // Update scale and others.
    canvas.scale *= zoom;
}
// **************************************************



// ************ RESIZE HANDLE FUNCTIONS *************
let handles = new Entity()

let outerX, outerY, outerW, outerH,
    innerX, innerY, innerW, innerH,
    localPoint,
    activeHandles = [];

handles.render = function (ctx) {
    let size = handleSize / canvas.scale;
    
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.beginPath();
    ctx.rect(-this.halfw, -this.halfh, this.w, this.h);
    ctx.rect(-size - this.halfw, -size - this.halfh, this.w + size * 2, this.h + size * 2);
    ctx.rect(size - this.halfw, size - this.halfh, this.w - size * 2, this.h - size * 2);
    ctx.stroke();

    ctx.rotate(-this.rotation);
    ctx.translate(-this.x, -this.y);
}
function getHandleIntersection(x, y) {
    //returns [x, y] where x or y can be -1, 0, or 1. Examples:
    //* [-1, 0] is the Left edge
    //* [1, 1] is the bottom right corner
    //* [] intersects but not on handle
    //* undefined = no intersections
    if (selected.length <= 0) return undefined;

    activeHandles = [];
    localPoint = utils.rotatePoint(handles.x, handles.y, x, y, handles.rotation);

    outerX = handles.x - handles.halfw - handleSize;
    outerY = handles.y - handles.halfh - handleSize;
    outerW = handles.w + handleSize * 2;
    outerH = handles.h + handleSize * 2;

    // return if point is outside the outer rect
    if (!utils.pointInRectangle(localPoint.x, localPoint.y, outerX, outerY, outerW, outerH)) return undefined;

    innerX = handles.x - handles.halfw + handleSize;
    innerY = handles.y - handles.halfh + handleSize;
    innerW = handles.w - handleSize * 2;
    innerH = handles.h - handleSize * 2;

    // return if point is inside the inner rect
    if (utils.pointInRectangle(localPoint.x, localPoint.y, innerX, innerY, innerW, innerH)) return activeHandles;

    activeHandles = [0, 0];
    // check left and right handles
    if (localPoint.x <= innerX) activeHandles[0] = -1;
    else if (localPoint.x >= innerX + innerW) activeHandles[0] = 1;

    // check top and bottom handles
    if (localPoint.y <= innerY) activeHandles[1] = -1;
    else if (localPoint.y >= innerY + innerH) activeHandles[1] = 1;
    return activeHandles;
}
function showHandles() {
    let boundingLeft = selected[0].x,
        boundingRight = selected[0].x,
        boundingTop = selected[0].y,
        boundingBottom = selected[0].y;

    for (let len = selected.length, i = 0; i < len; i++) {
        let entity = selected[i];

        let angle = entity.rotation % (Math.PI);
        if (angle > Math.PI/2) angle = Math.PI - angle;

        let halfW = (Math.sin(angle) * entity.h + Math.cos(angle) * entity.w) / 2,
            halfH = (Math.sin(angle) * entity.w + Math.cos(angle) * entity.h) / 2;

        let left = entity.x - halfW,
            right = entity.x + halfW,
            top = entity.y - halfH,
            bottom = entity.y + halfH;

        if (left < boundingLeft) boundingLeft = left;
        if (right > boundingRight) boundingRight = right;
        if (top < boundingTop) boundingTop = top;
        if (bottom > boundingBottom) boundingBottom = bottom;
    }

    handles.w = boundingRight - boundingLeft;
    handles.h = boundingBottom - boundingTop;
    handles.x = boundingLeft + handles.w / 2;
    handles.y = boundingTop + handles.h / 2;
    handles.rotation = 0;

    // show handles
    canvas.UILayer.addEntity(handles);
}
function hideHandles() {
    canvas.UILayer.removeEntity(handles);
}
function resizeStart(x, y) {

}
function resizing(x, y) {

}
function resizeEnd() {

}
// **************************************************



// ************** SELECTION FUNCTIONS ***************
function selectPoint(x, y) {
    // convert screen point to canvas point
    let point = canvas.screenToCanvas(x, y);

    // check for entity intersections
    let intersectedEntity = canvas.activeLayer.getFirstIntersection(point.x, point.y);
    if (!intersectedEntity) return;

    // check for duplicate selections
    for (let len = selected.length, i = 0; i < len; i++) {
        if (selected[i].ID == intersectedEntity.ID) {
            return;
        }
    }

    // Add intersectedEntity to selected[]
    selected.push(intersectedEntity);
    showHandles();

    //TEMP CODE -------------------------------
    let activeHandle = getHandleIntersection(point.x, point.y);
    console.log(activeHandle, selected);
    //END TEMP CODE ---------------------------
}
function clearSelection() {
    selected.length = 0;
    hideHandles();
}
function moveStart(x, y) {
    isMoving = true;
}
function moving(x, y) {

}
function moveEnd() {
    isMoving = false;
}
// **************************************************