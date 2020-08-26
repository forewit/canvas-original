// preferences
let longPressDelay = 500;
let doubleTapDelay = 300;
let longClickDelay = 500;
let doubleClickDelay = 300;


// tracking state
let elm;

let touchMoving = false;
let taps = 0;
let touchendTime = 0;
let touch = {};
let hypo = undefined;

let mouseMoving = false;
let clicks = 0;
let mouseupTime = 0;
let mouse = {};

let noop = function () { };
let callbacks = {
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
    pinch: noop,
    rotate: noop,
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

function copyTouch(touch) {
    return {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
    }
}

function wheelHandler(e) {
    // avoid using mouse so that wheel events don't override mouse move events
    let point = { x: e.clientX, y: e.clientY, deltaY: e.deltaY };

    // WHEEL DETECTION
    callbacks.wheel(point);

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
    touchMoving = false;

    window.addEventListener('touchmove', touchmoveHandler, { passive: false });
    window.addEventListener('touchend', touchendHandler);
    window.addEventListener('touchcancel', touchendHandler);
    touch = copyTouch(e.targetTouches[0]);

    // LONGPRESS DETECTION
    window.setTimeout(function () {
        let now = new Date();
        if (now - touchendTime >= longPressDelay && !touchMoving) {
            window.removeEventListener('touchmove', touchmoveHandler);
            window.removeEventListener('touchend', touchendHandler);
            window.removeEventListener('touchcancel', touchendHandler);
            callbacks.longPress(touch);
        }
    }, longPressDelay);

    e.preventDefault();
    e.stopPropagation();
}

function touchmoveHandler(e) {
    touchMoving = true;
    touch = copyTouch(e.targetTouches[0]);

    if (e.targetTouches.length === 2) {
        let touch2 = copyTouch(e.targetTouches[1]);
        let hypo1 = Math.hypot((touch.x - touch2.x), (touch.y - touch2.y));
        
        if (hypo === undefined) hypo = hypo1;
        
        callbacks.pinch(hypo1 / hypo);
    }
    // TOUCH DRAG START DETECTION
    if (!touchMoving) callbacks.touchDragStart(touch);


    e.preventDefault();
    e.stopPropagation();

    // TOUCH DRAGGING DETECTION
    callbacks.touchDragging(touch);
}

function touchendHandler(e) {
    hypo = undefined;
    
    if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != touch.identifier) {
        window.removeEventListener('touchmove', touchmoveHandler);
        window.removeEventListener('touchend', touchendHandler);
        window.removeEventListener('touchcancel', touchendHandler);

        touchendTime = new Date();

        if (!touchMoving) {
            // TAP DETECTION
            if (taps == 0) callbacks.tap(touch);

            // DOUBLE TAP DETECTION
            taps++;
            window.setTimeout(function () {
                if (taps > 1) callbacks.doubleTap(touch);
                taps = 0;
            }, doubleTapDelay);

        } else {
            // TOUCH DRAG END DETECTION
            callbacks.touchDragEnd(touch);
        }
    }
}