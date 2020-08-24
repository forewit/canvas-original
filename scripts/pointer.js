// preferences
let longPressDelay = 500;
let longClickDelay = 500;
let doubleTapDelay = 300;

// tracking state
let elm;
let moving = false;
let taps = 0;
let releaseTime = 0;
let point = {};
let noop = function () { };
let callbacks = {
    tap: noop,
    longPress: noop,
    longClick: noop,
    doubleTap: noop,
    rightClick: noop,
    dragStart: noop,
    dragging: noop,
    dragEnd: noop,
    pinch: noop,
    rotate: noop,
    wheel: noop
};

export let pointer = {
    on: on,
    off: off,
    start: start,
    stop: stop,
};

function on(name, callback) { callbacks[name] = callback; }
function off(name) { callbacks[name] = noop; }

function start(element) {
    elm = element;
    elm.addEventListener('touchstart', startHandler, { passive: false });
    elm.addEventListener('mousedown', startHandler, { passive: false });
    window.addEventListener('blur', blurHandler);
    window.addEventListener('wheel', wheelHandler);
    window.addEventListener('contextmenu', contextmenuHandler, { passive: false });
}

function stop() {
    elm.removeEventListener('touchstart', startHandler);
    elm.removeEventListener('mousedown', startHandler);
    window.removeEventListener('blur', blurHandler);
    window.removeEventListener('wheel', wheelHandler);
    window.removeEventListener('contextmenu', contextmenuHandler);
}

function copyTouch(touch) {
    return {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
    }
}

function blurHandler(e) { }

function wheelHandler(e) { }

function contextmenuHandler(e) { e.preventDefault(); }

function startHandler(e) {
    moving = false;

    if (e.type === 'mousedown') {
        window.addEventListener('mousemove', moveHandler, { passive: false });
        window.addEventListener('mouseup', endHandler);
        point = { x: e.clientX, y: e.clientY };

        // LONGCLICK DETECTION
        window.setTimeout(function () {
            let now = new Date();
            if (now - releaseTime >= longClickDelay && !moving) {
                window.removeEventListener('mousemove', moveHandler);
                window.removeEventListener('mouseup', endHandler);
                callbacks.longClick(point);
            }
        }, longClickDelay)
    } else {
        window.addEventListener('touchmove', moveHandler, { passive: false });
        window.addEventListener('touchend', endHandler);
        window.addEventListener('touchcancel', endHandler);
        point = copyTouch(e.targetTouches[0]);

        // LONGPRESS DETECTION
        window.setTimeout(function () {
            let now = new Date();
            if (now - releaseTime >= longPressDelay && !moving) {
                window.removeEventListener('touchmove', moveHandler);
                window.removeEventListener('touchend', endHandler);
                window.removeEventListener('touchcancel', endHandler);
                callbacks.longPress(point);
            }
        }, longPressDelay)
    }
    e.preventDefault();
    e.stopPropagation();
}

function moveHandler(e) {
    moving = true;

    if (e.type == 'mousemove') {
        point = { x: e.clientX, y: e.clientY };
        /////////////////////////
        // TODO: handle mouse drag
        /////////////////////////
    } else if (e.type == 'touchmove') {
        point = copyTouch(e.targetTouches[0]);
        e.preventDefault();
        e.stopPropagation();
        /////////////////////////
        // TODO: handle touch drag
        /////////////////////////
    }
}

function endHandler(e) {
    releaseTime = new Date();

    if (!moving) {
        // RIGHT CLICK DETECTION
        if (e.which === 3 || e.button === 2) {
            callbacks.rightClick(point);
        } else {
            // TAP DETECTION
            if (taps == 0) callbacks.tap(point);

            // DOUBLE TAP DETECTION
            taps++;
            window.setTimeout(function () {
                if (taps > 1) callbacks.doubleTap(point);
                taps = 0;
            }, doubleTapDelay);
        }
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