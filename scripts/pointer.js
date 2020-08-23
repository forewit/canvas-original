/*
AVAILABLE CALLBACKS
- tap
- longpress
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
let longPressDelay = 400;

// tracking state
let elm;
let moving = false;
let tapped = false;
let point = {};
let callbacks = {};

export let pointer = {
    on: on,
    off: off,
    start: start,
    stop: stop,
};

function on(name, callback) { callbacks[name] = callback; }
function off(name) { delete callbacks[name]; }

function start(element) {
    elm = element;
    elm.addEventListener('touchstart', startHandler, { passive: false });
    elm.addEventListener('mousedown', startHandler, { passive: false });
    window.addEventListener('blur', blurHandler);
    window.addEventListener('wheel', wheelHandler);
}

function stop() {
    elm.removeEventListener('touchstart', startHandler);
    elm.removeEventListener('mousedown', startHandler);
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

function blurHandler(e) { }

function wheelHandler(event) { }

function startHandler(e) {
    // TODO: check for rght-clicks
    if (e.which === 3) return;

    moving = false;
    tapped = false

    if (e.type === 'mousedown') {
        window.addEventListener('mousemove', moveHandler, { passive: false });
        window.addEventListener('mouseup', endHandler);
        point = { x: e.clientX, y: e.clientY };
    } else {
        window.addEventListener('touchmove', moveHandler, { passive: false });
        window.addEventListener('touchend', endHandler);
        window.addEventListener('touchcancel', endHandler);
        point = copyTouch(e.targetTouches[0]);

        // LONGPRESS DETECTION
        window.setTimeout(function () {
            if (!moving && !tapped && callbacks.longPress) {
                callbacks.longPress(point);
                window.removeEventListener('touchmove', moveHandler);
                window.removeEventListener('touchend', endHandler);
                window.removeEventListener('touchcancel', endHandler);
            }
        }, longPressDelay)
    }
    e.preventDefault();
    e.stopPropagation();
}

function moveHandler(e) {
    if (e.type == 'mousemove') {
        point = { x: e.clientX, y: e.clientY };
        /////////////////////////
        // TODO: handle mouse drag
        /////////////////////////
    } else {
        point = copyTouch(e.targetTouches[0]);
        e.preventDefault();
        e.stopPropagation();
        /////////////////////////
        // TODO: handle touch drag
        /////////////////////////
    }
    moving = true;
}

function endHandler(e) {
    // TAP DETECTION
    if (!moving && callbacks.tap) {
        tapped = true;
        callbacks.tap(point);
    }

    if (e.type === 'mouseup') {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        /////////////////////////
        // TODO: handle mouse up
        /////////////////////////
    } else if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != point.identifier) {
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', endHandler);
        window.removeEventListener('touchcancel', endHandler);
        /////////////////////////
        // TODO: handle touch end
        /////////////////////////
    }
}