// preferences
let longPressDelay = 500;
let doubleTapDelay = 300;
let longClickDelay = 500;
let doubleClickDelay = 300;

// tracking state
let elm;
let dragging = false;
let pinching = false;
let hypo = undefined;
let taps = 0;
let lastTouchEndTime = 0;
let touch = { identifier: undefined };
let mouseMoving = false;
let clicks = 0;
let mouseupTime = 0;
let mouse = {};

let noop = function () { };
let callbacks;
clear();

export let gestures = {
    on: on,
    off: off,
    start: start,
    stop: stop,
    clear: clear,
};

function on(name, callback) { callbacks[name] = callback; }
function off(name) { callbacks[name] = noop; }
function clear() {
    callbacks = {
        // mouse callbacks
        click: noop,
        doubleClick: noop,
        longClick: noop,
        rightClick: noop,
        wheel: noop,
        mouseDragStart: noop,
        mouseDragging: noop,
        mouseDragEnd: noop,
        // touch callbacks
        tap: noop,
        longPress: noop,
        doubleTap: noop,
        touchDragStart: noop,
        touchDragging: noop,
        touchDragEnd: noop,
        pinchStart: noop,
        pinching: noop,
        pinchEnd: noop,
    };
}

function start(element) {
    if (elm) stop();
    elm = element;
    elm.addEventListener('touchstart', touchstartHandler, { passive: false });
    elm.addEventListener('mousedown', mousedownHandler, { passive: false });
    elm.addEventListener('wheel', wheelHandler, { passive: false });
    elm.addEventListener('contextmenu', contextmenuHandler, { passive: false });
}

function stop() {
    elm.removeEventListener('touchstart', touchstartHandler);
    elm.removeEventListener('mousedown', mousedownHandler);
    elm.removeEventListener('wheel', wheelHandler);
    elm.removeEventListener('contextmenu', contextmenuHandler);
}

function copyTouch(newTouch) {
    return {
        identifier: newTouch.identifier,
        x: newTouch.clientX,
        y: newTouch.clientY
    }
}

function wheelHandler(e) {
    // avoid using mouse so that wheel events don't override mouse move events
    let point = { x: e.clientX, y: e.clientY };

    // WHEEL DETECTION
    callbacks.wheel(point, e.deltaY);

    e.preventDefault();
    e.stopPropagation();
}

function contextmenuHandler(e) { e.preventDefault(); }

function mousedownHandler(e) {
    mouseMoving = false;

    window.addEventListener('mousemove', mousemoveHandler, { passive: false });
    window.addEventListener('mouseup', mouseupHandler);
    mouse = { x: e.clientX, y: e.clientY };

    // LONGCLICK DETECTION
    window.setTimeout(function () {
        let now = new Date();
        if (now - mouseupTime >= longClickDelay && !mouseMoving) {
            window.removeEventListener('mousemove', mousemoveHandler);
            window.removeEventListener('mouseup', mouseupHandler);
            callbacks.longClick(mouse);
        }
    }, longClickDelay)

    e.preventDefault();
    e.stopPropagation();
}

function mousemoveHandler(e) {
    // MOUSE DRAG START DETECTION
    if (!mouseMoving) callbacks.mouseDragStart(mouse);

    mouseMoving = true;

    mouse = { x: e.clientX, y: e.clientY };

    // MOUUSE DRAGGING DETECTION
    callbacks.mouseDragging(mouse);
}

function mouseupHandler(e) {
    window.removeEventListener('mousemove', mousemoveHandler);
    window.removeEventListener('mouseup', mouseupHandler);

    mouseupTime = new Date();

    if (!mouseMoving) {
        // RIGHT CLICK DETECTION
        if (e.which === 3 || e.button === 2) {
            callbacks.rightClick(mouse);
        } else {
            // CLICK DETECTION
            if (clicks == 0) callbacks.click(mouse);

            // DOUBLE CLICK DETECTION
            clicks++;
            window.setTimeout(function () {
                if (clicks > 1) callbacks.doubleClick(mouse);
                clicks = 0;
            }, doubleClickDelay);
        }
    } else {
        // MOUSE DRAG END DETECTION
        callbacks.mouseDragEnd(mouse);
    }
}

function touchstartHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    // check if two touches were started simultaneously
    if (e.targetTouches.length > 1) {
        if (e.targetTouches[0] == touch.identifier) return;
        else pinching = true;
    }

    window.addEventListener('touchmove', touchmoveHandler, { passive: false });
    window.addEventListener('touchend', touchendHandler);
    window.addEventListener('touchcancel', touchendHandler);

    // update primary touch location
    touch = copyTouch(e.targetTouches[0]);

    // LONGPRESS DETECTION
    window.setTimeout(function () {
        // cancel long press if in the middle of a gesture
        if (dragging || pinching) return;

        // verify the touch hasn't been released
        let now = new Date();
        if (now - lastTouchEndTime >= longPressDelay) {
            window.removeEventListener('touchmove', touchmoveHandler);
            window.removeEventListener('touchend', touchendHandler);
            window.removeEventListener('touchcancel', touchendHandler);
            dragging = false;
            pinching = false;
            hypo = undefined;

            callbacks.longPress(touch);
        }
    }, longPressDelay);
}

function touchmoveHandler(e) {
    e.preventDefault();
    e.stopPropagation();

    if (dragging) {
        touch = copyTouch(e.targetTouches[0]);
        callbacks.touchDragging(touch);
        return;

    } else if (pinching || e.targetTouches.length > 1) {
        touch = copyTouch(e.targetTouches[0]);
        let touch2 = copyTouch(e.targetTouches[1]);
        let center = {
            x: (touch.x + touch2.x) / 2,
            y: (touch.y + touch2.y) / 2
        }

        let hypo1 = Math.hypot((touch.x - touch2.x), (touch.y - touch2.y));
        if (hypo === undefined) {
            hypo = hypo1;
            callbacks.pinchStart(center);
        }

        pinching = true;
        callbacks.pinching(center, hypo1 / hypo);
        hypo = hypo1;
        return;
    } else {
        dragging = true;
        callbacks.touchDragStart(touch);
        touch = copyTouch(e.targetTouches[0]);
        callbacks.touchDragging(touch);
    }
}

function touchendHandler(e) {
    if (dragging &&
        e.targetTouches.length > 0 &&
        e.targetTouches[0].identifier == touch.identifier) {
        return;
    }

    lastTouchEndTime = new Date();
    window.removeEventListener('touchmove', touchmoveHandler);
    window.removeEventListener('touchend', touchendHandler);
    window.removeEventListener('touchcancel', touchendHandler);

    if (dragging) {
        dragging = false;
        callbacks.touchDragEnd();
    } else if (pinching) {
        pinching = false;
        hypo = undefined;
        callbacks.pinchEnd()
    } else {
        // TAP DETECTION
        if (taps == 0) callbacks.tap(touch);

        // DOUBLE TAP DETECTION
        taps++;
        window.setTimeout(function () {
            if (taps > 1) callbacks.doubleTap(touch);
            taps = 0;
        }, doubleTapDelay);
    }
}