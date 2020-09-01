import { gestures } from "./gestures.js";
import { keys } from "./keys.js";
import { Entity } from "./entity.js";


// preferences
let zoomIntensity = 0.2;
let inertiaFriction = 0.9;
let epsilon = 0.001;

// tracking state
let canvas = undefined;
let isPanning = false;
let lastPanTime, lastPoint, xVelocities, yVelocities;
let dx, dy;

let log = document.getElementById('log');
let log2 = document.getElementById('log2');

// touch gestures
gestures.on('tap', point => log.innerHTML = 'tap');
gestures.on('doubleTap', point => log.innerHTML = 'doubleTap');
gestures.on('longPress', point => log.innerHTML = 'longPress');
gestures.on('touchDragStart', point => {
    log.innerHTML = 'touchDragStart';
    panStart(point);
});
gestures.on('touchDragging', point => {
    log.innerHTML = 'touchDragging';
    panning(point)
});
gestures.on('touchDragEnd', () => {
    log.innerHTML = 'touchDragEnd';
    panEnd();
});
gestures.on('pinchStart', (point) => {
    //log2.innerHTML = "pinchStart";
    panStart(point);
});
gestures.on('pinching', (point, zoom) => {
    //log2.innerHTML = zoom;
    pinching(point, zoom);
    panning(point);
});
gestures.on('pinchEnd', () => {
    //log2.innerHTML = zoom;
    panEnd();
});

// mouse gestures
gestures.on('click', point => log.innerHTML = 'click');
gestures.on('doubleClick', point => log.innerHTML = 'doubleClick');
gestures.on('rightClick', point => log.innerHTML = 'rightClick');
gestures.on('longClick', point => log.innerHTML = 'longClick');
gestures.on('wheel', (point, delta) => {
    log.innerHTML = 'wheel';
    zoom(point, delta);
});
gestures.on('mouseDragStart', point => {
    log.innerHTML = 'mouseDragStart';
    panStart(point);
});
gestures.on('mouseDragging', point => {
    log.innerHTML = 'mouseDragging'
    panning(point);
});
gestures.on('mouseDragEnd', () => {
    log.innerHTML = 'mouseDragEnd';
    panEnd();
});

// shortcut keys
keys.on('17 82', function (e) {
    e.preventDefault();
    console.log('Prevented reload!');
});

export let interact = {
    start: start,
    stop: stop,
};

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
    lastPoint = point;
    isPanning = true;
    xVelocities = [0,0]; yVelocities = [0,0];
}
function panning(point) {
    dx = (point.x - lastPoint.x) / canvas.scale;
    dy = (point.y - lastPoint.y) / canvas.scale;

    xVelocities[1] = xVelocities[0];
    xVelocities[0] = dx;

    yVelocities[1] = yVelocities[0];
    yVelocities[0] = dy;

    canvas.originx -= dx;
    canvas.originy -= dy;
    canvas.ctx.translate(dx, dy);

    lastPoint = point;
    lastPanTime = new Date();
}
function panEnd() {
    let now = new Date();
    isPanning = false;

    if (now - lastPanTime < 10) panInertia();
}

function panInertia() {
    let vx = (xVelocities[0] + xVelocities[1]) / 2;
    let vy = (yVelocities[0] + yVelocities[1]) / 2;

    if (isPanning || (Math.abs(vx) < epsilon && Math.abs(vy) < epsilon)) return;
    requestAnimationFrame(panInertia);

    canvas.originx -= vx;
    canvas.originy -= vy;
    canvas.ctx.translate(vx, vy);

    xVelocities[0] *= inertiaFriction;
    xVelocities[1] *= inertiaFriction;
    yVelocities[0] *= inertiaFriction;
    yVelocities[1] *= inertiaFriction;
}

function pinching(point, zoom) {

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

function zoom(point, delta) {
    // Normalize wheel to +1 or -1.
    let wheel = delta < 0 ? 1 : -1;

    // Compute zoom factor.
    let zoom = Math.exp(wheel * zoomIntensity);

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
/*
let handle = new Entity()
handle.on = function(x,y) {
        //returns [x, y] where x or y can be -1, 0, or 1. Examples:
        //* [-1, 0] is the Left edge
        //* [1, 1] is the bottom right corner
        //* [] intersects but not on handle
        //* undefined -0

       let activeHandles = [];

       let localPoint = utils.rotatePoint(this.x, this.y, x, y, this.rotation);
       let localX = localPoint[0];
       let localY = localPoint[1];

       let outerX = this.x - this.handleSize;
       let outerY = this.y - this.handleSize;
       let outerW = this.w + this.handleSize * 2;
       let outerH = this.h + this.handleSize * 2;

       // return if point is outside the outer rect
       if (!utils.pointInRectangle(localX, localY, outerX, outerY, outerW, outerH)) return undefined;


       let innerX = this.x + this.handleSize;
       let innerY = this.y + this.handleSize;
       let innerW = this.w - this.handleSize * 2;
       let innerH = this.h - this.handleSize * 2;

       // return if point is inside the inner rect
       if (utils.pointInRectangle(localX, localY, innerX, innerY, innerW, innerH)) return activeHandles;

       activeHandles = [0,0];
       // check left and right handles
       if (localX <= innerX) activeHandles[0] = -1;
       else if (localX >= innerX + innerW) activeHandles[0] = 1;

       // check top and bottom handles
       if (localY <= innerY) activeHandles[1] = -1;
       else if (localY >= innerY + innerH) activeHandles[1] = 1;
       return activeHandles;
}
*/