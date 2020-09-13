import { gestures } from "./gestures.js";
import { keys } from "./keys.js";
import { Entity } from "./entity.js";
import * as utils from "./utils.js";


// preferences
let zoomIntensity = 0.05;
let inertiaFriction = 0.8; // 0 = infinite friction, 1 = no friction
let inertiaMemory = 0.2; // 0 = infinite memory, 1 = no memory
let inertiaDropOff = 5 // in milliseconds
let epsilon = 0.001;
let handleSize = 5;

// tracking state
/**
 * Tools:
 * 0 - pan
 * 1 - select
 * 2 - measure
 * 3 - draw
 */
let selected = [];
let canvas = undefined;
let isPanning = false;
let lastPanTime, lastPoint;
let vx = 0, vy = 0;
let log = document.getElementById('log');

export let interact = {
    setTool: setTool,
    start: start,
    stop: stop,
};

function setTool(name) {
    gestures.clear();

    switch (name) {
        // ********************** PAN TOOL *************************
        case 'pan':
            log.innerHTML = 'Pan';
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
                panStart(point);
            });
            gestures.on('touchDragging', point => {
                console.log('touch dragging');
                panning(point)
            });
            gestures.on('touchDragEnd', () => {
                console.log('touch drag end');
                panEnd();
            });
            gestures.on('pinchStart', (point) => {
                console.log('pinch start');
                panStart(point);
            });
            gestures.on('pinching', (point, zoom) => {
                console.log('pinching');
                zoomOnPoint(point, zoom);
                panning(point);
            });
            gestures.on('pinchEnd', () => {
                console.log('pinch end');
                panEnd();
            });

            // mouse gestures
            gestures.on('click', point => {
                console.log('click');
                addToSelection(point);
            });
            gestures.on('doubleClick', point => {
                console.log('double click');
                clearSelection();
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
                panStart(point);
            });
            gestures.on('mouseDragging', point => {
                console.log('mouse dragging');
                panning(point);
            });
            gestures.on('mouseDragEnd', () => {
                console.log('mouse drag end');
                panEnd();
            });
            break;

        // ******************** SELECT TOOL ************************
        case 'select':
            break;

        // ******************* MEASURE TOOL ************************
        case 'measure':
            break;

        // ********************* DRAW TOOL *************************
        case 'draw':
            break;
        default:
            console.log('Invalid tool choice!');
            break;

        // TODO: set default key shortcuts?
    }
}

// shortcut keys
keys.on('17 82', function (e) {
    e.preventDefault();
    console.log('Prevented reload!');
});

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

function wheel(point, delta) {
    // Normalize wheel to +1 or -1.
    let wheel = delta < 0 ? 1 : -1;

    // Compute zoom factor.
    let zoom = Math.exp(wheel * zoomIntensity);

    // zoom
    zoomOnPoint(point, zoom);
}

let handles = new Entity()
handles.w = 50;
handles.h = 50;
handles.x = 50;
handles.y = 50;

let outerX, outerY, outerW, outerH,
    innerX, innerY, innerW, innerH,
    localPoint, localX, localY,
    activeHandles = [];

handles.render = function (ctx) {
    if (this.updated) {
        
    }
    this.updated = false;

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

function addToSelection(screenPoint) {
    // convert screen point to canvas point
    let point = canvas.screenToCanvas(screenPoint);

    // show handles
    canvas.UILayer.addEntity(handles);

    let handle = getHandleIntersection(point.x, point.y);
    let intersection = canvas.activeLayer.getFirstIntersection(point.x, point.y);
    
    console.log(screenPoint, point);
    console.log(handle, intersection);
}

function clearSelection() {
    canvas.UILayer.removeEntity(handles);
}

function getHandleIntersection(x, y) {
    //returns [x, y] where x or y can be -1, 0, or 1. Examples:
    //* [-1, 0] is the Left edge
    //* [1, 1] is the bottom right corner
    //* [] intersects but not on handle
    //* undefined = no intersections
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