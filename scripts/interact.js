import { gestures } from "./gestures.js";
import { keys } from "./keys.js";
import { Entity } from "./entity.js";
import * as utils from "./utils.js";


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

// EXPORTS-------------------------------------------
export let interact = {
    setTool: setTool,
    start: start,
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
            gestures.on('tap', point => {
                console.log('tap');
            });
            gestures.on('double tap', point => {
                console.log('double tap');
            });
            gestures.on('longPress', point => {
                console.log('long press');
            });
            gestures.on('touchDragStart', point => {
                console.log('touch drag start');
                mouseDragStart(point);
            });
            gestures.on('touchDragging', point => {
                console.log('touch dragging');
                mouseDragging(point)
            });
            gestures.on('touchDragEnd', () => {
                console.log('touch drag end');
                mouseDragEnd();
            });
            gestures.on('pinchStart', (point) => {
                console.log('pinch start');
                mouseDragStart(point);
            });
            gestures.on('pinching', (point, zoom) => {
                console.log('pinching');
                zoomOnPoint(point, zoom);
                panning(point);
            });
            gestures.on('pinchEnd', () => {
                console.log('pinch end');
                mouseDragEnd();
            });

            // mouse gestures
            gestures.on('click', point => {
                console.log('click');

                // clear selection if shift is not being held
                if (!keys.down[16]) clearSelection();

                selectPoint(point);
            });
            gestures.on('doubleClick', point => {
                console.log('double click');
            });
            gestures.on('rightClick', point => {
                console.log('right click');
            });
            gestures.on('longClick', point => {
                console.log('long click');
            });
            gestures.on('wheel', (point, delta) => {
                console.log('wheel');
                wheel(point, delta);
            });
            gestures.on('mouseDragStart', point => {
                console.log('mouse drag start');
                mouseDragStart(point);
            });
            gestures.on('mouseDragging', point => {
                console.log('mouse dragging');
                mouseDragging(point);
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
function start(cnvs) {
    canvas = cnvs;
    gestures.start(canvas.elm);
    keys.start()
}
function stop() {
    canvas = undefined;
    gestures.stop();
    keys.stop();
}
// END EXPORTS---------------------------------------



// **************** MOUSE TRIAGE FUNCTIONS ****************
function mouseDragStart(point) {
    /** TODO CASES
     * 1. dragging active handle -> resize selection
     * 2. draging active selection -> move selection
     * 3. dragging an unselected entity -> select entity & move selection
     * 4. dragging no entities -> pan
     */
    panStart(point);
}
function mouseDragging(point) {
    /** TODO CASES
     * 1. resize selection
     * 2. move selection
     * 3. pan
     */
    if (isPanning) {
        panning(point);
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
function panStart(point) {
    isPanning = true;
    lastPoint = point;
    vx = 0;
    vy = 0;
}
function panning(point) {
    let dx = (point.x - lastPoint.x) / canvas.scale;
    let dy = (point.y - lastPoint.y) / canvas.scale;

    vx = dx * inertiaMemory + vx * (1 - inertiaMemory);
    vy = dy * inertiaMemory + vy * (1 - inertiaMemory);

    canvas.originx -= dx;
    canvas.originy -= dy;
    canvas.ctx.translate(dx, dy);

    lastPoint = point;
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

    //console.log(vx);
    canvas.originx -= vx;
    canvas.originy -= vy;
    canvas.ctx.translate(vx, vy);

    vx *= inertiaFriction;
    vy *= inertiaFriction;
}
// **************************************************



// **************** ZOOMING FUNCTIONS ***************
function wheel(point, delta) {
    // Normalize wheel to +1 or -1.
    let wheel = delta < 0 ? 1 : -1;

    // Compute zoom factor.
    let zoom = Math.exp(wheel * zoomIntensity);

    // zoom
    zoomOnPoint(point, zoom);
}
function zoomOnPoint(point, zoom) {
    // Translate so the visible origin is at the context's origin.
    canvas.ctx.translate(canvas.originx, canvas.originy);

    // Compute the new visible origin. Original ly the mouse is at a
    // distance mouse/scale from the corner, we want the point under
    // the mouse to remain in the same place after the zoom, but this
    // is at mouse/new_scale away from the corner. Therefore we need to
    // shift the origin (coordinates of the corner) to account for this.
    canvas.originx -= point.x / (canvas.scale * zoom) - point.x / canvas.scale;
    canvas.originy -= point.y / (canvas.scale * zoom) - point.y / canvas.scale;

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
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.beginPath();
    ctx.rect(-this.halfw, -this.halfh, this.w, this.h);
    ctx.rect(-handleSize - this.halfw, -handleSize - this.halfh, this.w + handleSize * 2, this.h + handleSize * 2);
    ctx.rect(handleSize - this.halfw, handleSize - this.halfh, this.w - handleSize * 2, this.h - handleSize * 2);
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

    // TODO: need to adjust for larger levels of rotation
    let boundingLeft = selected[0].x,
        boundingRight = selected[0].x,
        boundingTop = selected[0].y,
        boundingBottom = selected[0].y;

    for (let len = selected.length, i = 0; i < len; i++) {
        let entity = selected[i];

        let halfW = (Math.sin(entity.rotation) * entity.h + Math.cos(entity.rotation) * entity.w) / 2,
            halfH = (Math.sin(entity.rotation) * entity.w + Math.cos(entity.rotation) * entity.h) / 2;

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
function resizeStart(point) {

}
function resizing(point) {

}
function resizeEnd() {

}
// **************************************************



// ************** SELECTION FUNCTIONS ***************
function selectPoint(screenPoint) {
    // convert screen point to canvas point
    let point = canvas.screenToCanvas(screenPoint);

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
function moveStart(point) {
    isMoving = true;
}
function moving(point) {

}
function moveEnd() {
    isMoving = false;
}
// **************************************************