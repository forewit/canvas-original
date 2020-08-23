/*
AVAILABLE CALLBACKS
- tap
- longPress
- doubleTap
- rightClick
- dragStart
- dragging
- dragEnd
- pinch
- rotate
- wheel
- blur
*/
// preferences
let longPressDelay = 100;

// tracking state
let _elm;
let _moving = false;
let _start = 0;
let _pointer = {};

export let pointer = {
    callbacks: {},
    start: start,
    stop: stop,
};

function start(elm) {
    stop();
    _elm = elm;
    _elm.addEventListener('touchstart', startHandler, { passive: false });
    _elm.addEventListener('mousedown', startHandler, { passive: false });
    window.addEventListener('blur', blurHandler);
    window.addEventListener('wheel', wheelHandler);
}

function stop() {
    _elm.removeEventListener('touchstart', startHandler);
    _elm.removeEventListener('mousedown', startHandler);
    window.removeEventListener('blur', blurHandler);
    window.removeEventListener('wheel', wheelHandler);
}

function copyTouch(touch) {
    return {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
    }
}

function blurHandler(e) {

}

let zoomIntensity = 0.1;
let originx = 0;
let originy = 0;
let scale = 1;
function wheelHandler(event) {

    //event.preventDefault();
    // Get mouse offset.
    let mousex = event.clientX - me.canvas.elm.offsetLeft;
    let mousey = event.clientY - me.canvas.elm.offsetTop;
    // Normalize wheel to +1 or -1.
    let wheel = event.deltaY < 0 ? 1 : -1;

    // Compute zoom factor.
    let zoom = Math.exp(wheel*zoomIntensity);
    
    // Translate so the visible origin is at the context's origin.
    me.canvas.ctx.translate(originx, originy);
  
    // Compute the new visible origin. Original ly the mouse is at a
    // distance mouse/scale from the corner, we want the point under
    // the mouse to remain in the same place after the zoom, but this
    // is at mouse/new_scale away from the corner. Therefore we need to
    // shift the origin (coordinates of the corner) to account for this.
    originx -= mousex/(scale*zoom) - mousex/scale;
    originy -= mousey/(scale*zoom) - mousey/scale;
    
    // Scale it (centered around the origin due to the trasnslate above).
    me.canvas.ctx.scale(zoom, zoom);
    // Offset the visible origin to it's proper position.
    me.canvas.ctx.translate(-originx, -originy);

    // Update scale and others.
    scale *= zoom;
    //visibleWidth = width / scale;
    //visibleHeight = height / scale;
}


function startHandler(e) {
    // TODO: check for rght-clicks
    if (e.which === 3) { return; }

    _start = Date.now();
    _moving = false;

    if (e.type === 'mousedown') {
        window.addEventListener('mousemove', moveHandler, { passive: false });
        window.addEventListener('mouseup', endHandler);
        _pointer = { x: e.clientX, y: e.clientY };
    } else {
        window.addEventListener('touchmove', moveHandler, { passive: false });
        window.addEventListener('touchend', endHandler);
        window.addEventListener('touchcancel', endHandler);
        _pointer = copyTouch(e.targetTouches[0]);
    }
    e.preventDefault();
    e.stopPropagation();
}

function moveHandler(e) {
    if (e.type == 'mousemove') {
        _pointer = { x: e.clientX, y: e.clientY };
        /////////////////////////
        // TODO: handle mouse drag
        /////////////////////////
    } else {
        _pointer = copyTouch(e.targetTouches[0]);
        e.preventDefault();
        e.stopPropagation();
        /////////////////////////
        // TODO: handle touch drag
        /////////////////////////
    }
    _moving = true;
}

function endHandler(e) {
    if (e.type === 'mouseup') {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        /////////////////////////
        // TODO: handle mouse up
        /////////////////////////
    } else if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != _pointer.identifier) {
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', endHandler);
        window.removeEventListener('touchcancel', endHandler);
        /////////////////////////
        // TODO: handle touch end
        /////////////////////////
    }
}