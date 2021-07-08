/**
 * Valid gestures:
 * 
 * wheel
 * click
 * doubleclick
 * longclick
 * mouse-drag-start
 * mouse-dragging
 * mouse-drag-end
 * 
 * tap
 * doubletap
 * longpress
 * touch-drag-start
 * touch-dragging
 * touch-drag-end
 * longpress-drag-start
 * longpress-dragging
 * longpress-drag-end
 * pinch-start
 * pinching
 * pinch-end
 */

 (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.gestures = {}));
}(this, (function (exports) {
    'use strict';

    // PREFERENCES
    const LONG_PRESS_DELAY = 500;
    const DOUBLE_TAP_DELAY = 300; // reduce to 100 to remove double taps
    const LONG_CLICK_DELAY = 500;
    const DOUBLE_CLICK_DELAY = 300; // reduce to 100 to remove double clicks

    // STATE MANAGEMENT
    let trackedElms = [],
        activeMouseElm = undefined,
        mouseMoving = false,
        clicks = 0,
        mouseupTime = 0,
        mouseDown = false,
        lastMouseX = 0,
        lastMouseY = 0,
        activeTouchElm = undefined,
        dragging = false,
        pinching = false,
        longpressed = false,
        taps = 0,
        lastTouchEndTime = 0,
        hypo = undefined,
        lastCenterX = 0,
        lastCenterY = 0,
        touch = { identifier: undefined, x: 0, y: 0 };

    // ************ HELPER FUNCTIONS **************
    function copyTouch(newTouch) {
        return {
            identifier: newTouch.identifier,
            x: newTouch.clientX,
            y: newTouch.clientY
        }
    }

    function dispatchGesture(elm, data) {
        let event = new CustomEvent("gesture", {
            detail: data,
            bubbles: false,
            cancelable: false
        })

        elm.dispatchEvent(event);
    }
    // *********** END HELPER FUNCTIONS ***********


    // ************** EVENT HANDLERS **************
    function blurHandler(e) {
        // Keep in mind that blur is a window event
        console.log("BLUR HANDLER");

        // remove other window event handlers
        window.removeEventListener('mousemove', mousemoveHandler);
        window.removeEventListener('mouseup', mouseupHandler);

        mouseupTime = new Date();
        mouseDown = false;

        // MOUSE DRAG END DETECTION
        if (mouseMoving) {
            dispatchGesture(activeMouseElm, {name:"mouse-drag-end", x:lastMouseX, y:lastMouseY});
            mouseMoving = false;
        }
    }

    function wheelHandler(e) {
        dispatchGesture(e.target, {name:"wheel", x:e.clientX, y:e.clientY, event:e})

        e.preventDefault();
        e.stopPropagation();
    }

    function contextmenuHandler(e) {
        // right-clicks are handled in the mouseup handler
        e.preventDefault();
        e.stopPropagation();
    }

    function mousedownHandler(e) {
        mouseMoving = false;

        window.addEventListener('mousemove', mousemoveHandler);
        window.addEventListener('mouseup', mouseupHandler);

        activeMouseElm = e.target;
        mouseDown = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // LONGCLICK DETECTION
        window.setTimeout(function () {
            let now = new Date();
            if (now - mouseupTime >= LONG_CLICK_DELAY && !mouseMoving) {
                window.removeEventListener('mousemove', mousemoveHandler);
                window.removeEventListener('mouseup', mouseupHandler);

                dispatchGesture(activeMouseElm, {name:"longclick", x:e.clientX, y:e.clientY})
            }
        }, LONG_CLICK_DELAY)

        e.preventDefault();
        e.stopPropagation();
    }

    function mousemoveHandler(e) {
        // return if no movement has taken place
        let dx = e.clientX - lastMouseX,
            dy = e.clientY - lastMouseY;
        if (dx == 0 && dy == 0) return;

        // MOUSE DRAG START DETECTION
        if (!mouseMoving) dispatchGesture(activeMouseElm, {name:"mouse-drag-start", x:e.clientX, y:e.clientY, event:e});

        // MOUUSE DRAGGING DETECTION
        mouseMoving = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        dispatchGesture(activeMouseElm, {name:"mouse-dragging", x:e.clientX, y:e.clientY, dx: dx, dy: dy })
    }

    function mouseupHandler(e) {
        // remove window event handlers
        window.removeEventListener('mousemove', mousemoveHandler);
        window.removeEventListener('mouseup', mouseupHandler);

        mouseupTime = new Date();
        mouseDown = false;

        if (mouseMoving) {
            // MOUSE DRAG END DETECTION
            dispatchGesture(activeMouseElm, {name:"mouse-drag-end", x:lastMouseX, y:lastMouseY})
            mouseMoving = false;
        } else {
            // RIGHT CLICK DETECTION
            if (e.which === 3 || e.button === 2) {
                dispatchGesture(activeMouseElm, {name:"right-click", x:e.clientX, y:e.clientY});
            } else {
                // CLICK DETECTION
                if (clicks == 0) dispatchGesture(activeMouseElm, {name:"click", x:e.clientX, y:e.clientY, event:e});

                // DOUBLE CLICK DETECTION
                clicks++;
                window.setTimeout(function () {
                    if (clicks > 1) dispatchGesture(activeMouseElm, {name:"double-click", x:e.clientX, y:e.clientY});
                    clicks = 0;
                }, DOUBLE_CLICK_DELAY);
            }
        }
    }

    function touchstartHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        // don't handle multiple touches if already tracking a touch
        if (e.targetTouches.length > 1) {
            if (e.targetTouches[0].identifier == touch.identifier) return;
            pinching = true;
        }

        window.addEventListener('touchmove', touchmoveHandler, { passive: false });
        window.addEventListener('touchend', touchendHandler);
        window.addEventListener('touchcancel', touchendHandler);

        // update primary touch location
        touch = copyTouch(e.targetTouches[0]);
        activeTouchElm = e.target;

        // longpress DETECTION
        window.setTimeout(function () {
            // cancel long press if in the middle of a gesture
            if (dragging || pinching) return;

            // verify the touch hasn't been released
            let now = new Date();
            if (now - lastTouchEndTime >= LONG_PRESS_DELAY) {
                dragging = false;
                pinching = false;
                hypo = undefined;
                longpressed = true;

                dispatchGesture(activeTouchElm, {name:"longpress", x:touch.x, y:touch.y})
            }
        }, LONG_PRESS_DELAY);
    }

    function touchmoveHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        if (dragging) {
            let lastX = touch.x,
                lastY = touch.y;

            touch = copyTouch(e.targetTouches[0]);

            // calculate change in x and y from last touch event
            let dx = touch.x - lastX,
                dy = touch.y - lastY;

            if (longpressed) {
                dispatchGesture(activeTouchElm, {name:"longpress-dragging", x:touch.x, y:touch.y, dx: dx, dy: dy })
            } else {
                dispatchGesture(activeTouchElm, {name:"touch-dragging", x:touch.x, y:touch.y, dx: dx, dy: dy });
            }
            return;
        } else if (!longpressed && (pinching || e.targetTouches.length > 1)) {
            touch = copyTouch(e.targetTouches[0]);
            let touch2 = copyTouch(e.targetTouches[1]);
            let center = {
                x: (touch.x + touch2.x) / 2,
                y: (touch.y + touch2.y) / 2
            }

            let hypo1 = Math.hypot((touch.x - touch2.x), (touch.y - touch2.y));
            if (hypo === undefined) {
                hypo = hypo1;
                lastCenterX = center.x;
                lastCenterY = center.y;
                dispatchGesture(activeTouchElm, {name:"pinch-start", x:center.x, y:center.y})
            }

            pinching = true;
            let zoom = hypo1 / hypo;
            let dx = center.x - lastCenterX,
                dy = center.y - lastCenterY;
            dispatchGesture(activeTouchElm, {name:"pinching", x:center.x, y:center.y, zoom: zoom, dx: dx, dy: dy });
            hypo = hypo1;
            lastCenterX = center.x;
            lastCenterY = center.y;
            return;
        } else {
            dragging = true;
            if (longpressed) {
                dispatchGesture(activeTouchElm, {name:"longpress-drag-start", x:touch.x, y:touch.y, event:e})
                touch = copyTouch(e.targetTouches[0]);
                dispatchGesture(activeTouchElm, {name:"longpress-dragging", x:touch.x, y:touch.y, dx: 0, dy: 0});

            } else {
                dispatchGesture(activeTouchElm, {name:"touch-drag-start", x:touch.x, y:touch.y, event:e});
                touch = copyTouch(e.targetTouches[0]);
                dispatchGesture(activeTouchElm, {name:"touch-dragging", x:touch.x, y:touch.y, dx: 0, dy: 0 });
            }
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
            if (longpressed) {
                dispatchGesture(activeTouchElm, {name:"longpress-drag-end", x:touch.x, y:touch.y});
            } else {
                dispatchGesture(activeTouchElm, {name:"touch-drag-end", x:touch.x, y:touch.y});
            }
        } else if (pinching) {
            pinching = false;
            hypo = undefined;
            dispatchGesture(activeTouchElm, {name:"pinch-end", x:touch.x, y:touch.y})
        } else if (!longpressed) {
            // TAP DETECTION
            if (taps == 0) dispatchGesture(activeTouchElm, {name:"tap", x:touch.x, y:touch.y, event:e});

            // DOUBLE TAP DETECTION
            taps++;
            window.setTimeout(function () {
                if (taps > 1) dispatchGesture(activeTouchElm, {name:"doubletap", x:touch.x, y:touch.y});
                taps = 0;
            }, DOUBLE_TAP_DELAY);
        }

        longpressed = false;
    }
    // ************ END EVENT HANDLERS ************


    // ****************** EXPORTS ***********************
    exports.track = function (elm) {
        // return if element is already being tracked
        for (var i = 0; i < trackedElms.length; i++) {
            if (elm === trackedElms[i]) return;
        }

        // add window event listeners if this is the first tracked element
        if (trackedElms.length == 0) {
            window.addEventListener('blur', blurHandler);
        }

        // start tracking the element
        trackedElms.push(elm);

        // add event listeners
        elm.addEventListener('touchstart', touchstartHandler, { passive: false });
        elm.addEventListener('mousedown', mousedownHandler, { passive: false });
        elm.addEventListener('wheel', wheelHandler, { passive: false });
        elm.addEventListener('contextmenu', contextmenuHandler, { passive: false });
    }

    exports.untrack = function (elm) {
        // make sure element is actually being tracked
        for (var i = 0; i < trackedElms.length; i++) {
            if (elm === trackedElms[i]) {

                // stop tracking the element
                trackedElms.splice(i, 1);

                // remove event listeners
                elm.removeEventListener('touchstart', touchstartHandler);
                elm.removeEventListener('mousedown', mousedownHandler);
                elm.removeEventListener('wheel', wheelHandler);
                elm.removeEventListener('contextmenu', contextmenuHandler);
            }
        }

        // remove window event listeners if everything is untracked
        if (trackedElms.length == 0) {
            window.addEventListener('blur', blurHandler);
        }
    }

    exports.untrackAll = function () {
        for (var i = 0; i < trackedElms.length; i++) {
            untrack(trackedElms[i]);
        }
    }
    // ****************** END EXPORTS ********************

    // ************* DEBUGGING ****************
    exports.printTrackedElms = function () { console.log(trackedElms) };
    // ****************************************

    Object.defineProperty(exports, '__esModule', { value: true });
})));