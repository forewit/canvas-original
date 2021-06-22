/**
 * TODO: change from individual callbacks to a listener?
 * custom event "gesture" details: {name, x, y}
 * 
 * Gestures.js -- a class to track mouse and touch gestures on an element
 * Initialize by using new Gestures(element)
 *
 * Multiple gesture callbacks can be set using a space-separated string
 * using the following supported options:
 * 
 *      mouseDragEnd 		-> x, y
 *      blur
 *      wheel 			    -> x, y, event
 *      click			    -> x, y
 *      rightClick		    -> x, y
 *      longClick 		    -> x, y
 *      doubleClick		    -> x, y
 *      mouseDragStart		-> x, y
 *      mouseDragging       -> x, y
 *      mouseDragEnd		-> x, y
 *      longpress		    -> x, y
 *      longpressDragStart	-> x, y
 *      longpressDragging	-> x, y
 *      longpressDragEnd
 *      touchDragStart		-> x, y
 *      touchDragging		-> x, y
 *      touchDragEnd
 *      pinchStart		    -> x, y
 *      pinching		    -> x, y, scale
 *      pinchEnd
 *      tap			        -> x, y
 *      doubleTap		    -> x, y
 * 
 * on(gestures, callback)   Adds a callback to the listed gestures. Example:
 *                              on("click tap", (pointer)=>{console.log(pointer.x, pointer.y)})
 * off(gestures)            Removes callbacks from the listed gestures. Example: 
 *                              off("click tap")
 * clear()                  Clears all callbacks for all gestures
 * start()                  starts tracking gestures on the element
 * stop()                   pauses tracking gestures on the element
 */

 (function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.Gestures = factory();
    }
}(this, function () {

    'use strict';

    // PREFERENCES
    const LONG_PRESS_DELAY = 500;
    const DOUBLE_TAP_DELAY = 300; // reduce to 100 to remove double taps
    const LONG_CLICK_DELAY = 500;
    const DOUBLE_CLICK_DELAY = 300; // reduce to 100 to remove double taps

    function noop() { };

    function copyTouch(newTouch) {
        return {
            identifier: newTouch.identifier,
            x: newTouch.clientX,
            y: newTouch.clientY
        }
    }

    class Gestures {
        constructor(element) {
            // STATE MANAGEMENT
            this.elm = element;
            this.dragging = false;
            this.pinching = false;
            this.longpressed = false;
            this.hypo = undefined;
            this.taps = 0;
            this.lastTouchEndTime = 0;
            this.mouseMoving = false;
            this.clicks = 0;
            this.mouseupTime = 0;
            this.mouse = { down: false, x: 0, y: 0 };
            this.touch = { identifier: undefined, x: 0, y: 0 };
            this.callbacks = {};

            // clear all callbacks
            this.clear();

            // bind handlers
            this.blurHandler = this.blurHandle.bind(this);
            this.wheelHandler = this.wheelHandle.bind(this);
            this.mousedownHandler = this.mousedownHandle.bind(this);
            this.mousemoveHandler = this.mousemoveHandle.bind(this);
            this.mouseupHandler = this.mouseupHandle.bind(this);
            this.contextmenuHandler = this.contextmenuHandle.bind(this);
            this.touchstartHandler = this.touchstartHandle.bind(this);
            this.touchmoveHandler = this.touchmoveHandle.bind(this);
            this.touchendHandler = this.touchendHandle.bind(this);
        }

        clear() {
            this.callbacks = {
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
                longpress: noop,
                longpressDragStart: noop,
                longpressDragging: noop,
                longpressDragEnd: noop,
                doubleTap: noop,
                touchDragStart: noop,
                touchDragging: noop,
                touchDragEnd: noop,
                pinchStart: noop,
                pinching: noop,
                pinchEnd: noop,
                // window callbacks
                blur: noop,
            };
        }

        on(name, callback) {
            let words =  name.split(" ");

            for (let i = 0; i < words.length; i++)
                this.callbacks[words[i]] = callback
        }

        off(name) {
            let words = name.split(" ");
        
            for (let i = 0; i < words.length; i++)
                this.callbacks[words[i]] = noop
        }

        start() {
            var me = this;

            me.elm.addEventListener('touchstart', me.touchstartHandler, { passive: false });
            me.elm.addEventListener('mousedown', me.mousedownHandler, { passive: false });
            me.elm.addEventListener('wheel', me.wheelHandler, { passive: false });
            me.elm.addEventListener('contextmenu', me.contextmenuHandler, { passive: false });
            window.addEventListener('blur', me.blurHandler);
        }

        stop() {
            var me = this;

            me.elm.removeEventListener('touchstart', me.touchstartHandler);
            me.elm.removeEventListener('mousedown', me.mousedownHandler);
            me.elm.removeEventListener('wheel', me.wheelHandler);
            me.elm.removeEventListener('contextmenu', me.contextmenuHandler);
            window.removeEventListener('blur', me.blurHandler);
        }
    
        blurHandle(e) {
            var me = this;

            window.removeEventListener('mousemove', me.mousemoveHandler);
            window.removeEventListener('mouseup', me.mouseupHandler);
    
            me.mouseupTime = new Date();
            me.mouse.down = false;
            
            // MOUSE DRAG END DETECTION
            if (me.mouseMoving) {
                me.callbacks.mouseDragEnd(me.mouse.x, me.mouse.y);
            }
    
            me.callbacks.blur();
        }
    
        wheelHandle(e) {
            // avoid using this.mouse so that wheel events don't override mouse move events
            let point = { x: e.clientX, y: e.clientY };
    
            // WHEEL DETECTION
            this.callbacks.wheel(point.x, point.y, e);
    
            e.preventDefault();
            e.stopPropagation();
        }
    
        contextmenuHandle(e) { e.preventDefault(); }
    
        mousedownHandle(e) {
            var me = this;

            me.mouseMoving = false;
    
            window.addEventListener('mousemove', me.mousemoveHandler, { passive: false });
            window.addEventListener('mouseup', me.mouseupHandler);

            me.mouse.down = true;
            me.mouse.x = e.clientX;
            me.mouse.y = e.clientY;
    
            // LONGCLICK DETECTION
            window.setTimeout(function () {
                let now = new Date();
                if (now - me.mouseupTime >= LONG_CLICK_DELAY && !me.mouseMoving) {
                    window.removeEventListener('mousemove', me.mousemoveHandler);
                    window.removeEventListener('mouseup', me.mouseupHandler);
                    me.callbacks.longClick(me.mouse.x, me.mouse.y);
                }
            }, LONG_CLICK_DELAY)
    
            e.preventDefault();
            e.stopPropagation();
        }
    
        mousemoveHandle(e) {
            var me = this;

            // MOUSE DRAG START DETECTION
            if (!me.mouseMoving) me.callbacks.mouseDragStart(me.mouse.x, me.mouse.y);
    
            me.mouseMoving = true;
    
            me.mouse.x = e.clientX;
            me.mouse.y = e.clientY;

            // MOUUSE DRAGGING DETECTION
            me.callbacks.mouseDragging(me.mouse.x, me.mouse.y);
        }
    
        mouseupHandle(e) {
            var me = this;

            window.removeEventListener('mousemove', me.mousemoveHandler);
            window.removeEventListener('mouseup', me.mouseupHandler);
    
            me.mouseupTime = new Date();
            me.mouse.down = false;
    
            if (!me.mouseMoving) {
                // RIGHT CLICK DETECTION
                if (e.which === 3 || e.button === 2) {
                    me.callbacks.rightClick(me.mouse.x, me.mouse.y);
                } else {
                    // CLICK DETECTION
                    if (me.clicks == 0) me.callbacks.click(me.mouse.x, me.mouse.y);
    
                    // DOUBLE CLICK DETECTION
                    me.clicks++;
                    window.setTimeout(function () {
                        if (me.clicks > 1) me.callbacks.doubleClick(me.mouse.x, me.mouse.y);
                        me.clicks = 0;
                    }, DOUBLE_CLICK_DELAY);
                }
            } else {
                // MOUSE DRAG END DETECTION
                me.callbacks.mouseDragEnd(me.mouse.x, me.mouse.y);
            }
        }
    
        touchstartHandle(e) {
            var me = this;

            e.preventDefault();
            e.stopPropagation();
    
            // don't handle multiple touches if already tracking a touch
            if (e.targetTouches.length > 1) {
                if (e.targetTouches[0].identifier == me.touch.identifier) return; 
                me.pinching = true;
            }
    
            window.addEventListener('touchmove', me.touchmoveHandler, { passive: false });
            window.addEventListener('touchend', me.touchendHandler);
            window.addEventListener('touchcancel', me.touchendHandler);
    
            // update primary touch location
            me.touch = copyTouch(e.targetTouches[0]);
    
            // longpress DETECTION
            window.setTimeout(function () {
                // cancel long press if in the middle of a gesture
                if (me.dragging || me.pinching) return;
    
                // verify the touch hasn't been released
                let now = new Date();
                if (now - me.lastTouchEndTime >= LONG_PRESS_DELAY) {
                    //window.removeEventListener('touchmove', me.touchmoveHandler);
                    //window.removeEventListener('touchend', me.touchendHandler);
                    //window.removeEventListener('touchcancel', me.touchendHandler);
                    me.dragging = false;
                    me.pinching = false;
                    me.hypo = undefined;
                    me.longpressed = true;
    
                    me.callbacks.longpress(me.touch.x, me.touch.y);
                }
            }, LONG_PRESS_DELAY);
        }
    
        touchmoveHandle(e) {
            var me = this;

            e.preventDefault();
            e.stopPropagation();
    
            if (me.dragging) {
                me.touch = copyTouch(e.targetTouches[0]);
                (me.longpressed) ?  me.callbacks.longpressDragging(me.touch.x, me.touch.y) : me.callbacks.touchDragging(me.touch.x, me.touch.y);
                return;
    
            } else if (!me.longpressed && (me.pinching || e.targetTouches.length > 1)) {
                me.touch = copyTouch(e.targetTouches[0]);
                let touch2 = copyTouch(e.targetTouches[1]);
                let center = {
                    x: (me.touch.x + touch2.x) / 2,
                    y: (me.touch.y + touch2.y) / 2
                }
    
                let hypo1 = Math.hypot((me.touch.x - touch2.x), (me.touch.y - touch2.y));
                if (me.hypo === undefined) {
                    me.hypo = hypo1;
                    me.callbacks.pinchStart(center.x, center.y);
                }
    
                me.pinching = true;
                let scale = hypo1 / me.hypo;
                me.callbacks.pinching(center.x, center.y, scale);
                me.hypo = hypo1;
                return;
            } else {
                me.dragging = true;
                me.callbacks.touchDragStart(me.touch.x, me.touch.y);

                (me.longpressed) ?  me.callbacks.longpressDragStart(me.touch.x, me.touch.y) : me.callbacks.touchDragStart(me.touch.x, me.touch.y);
                me.touch = copyTouch(e.targetTouches[0]);
                (me.longpressed) ?  me.callbacks.longpressDragging(me.touch.x, me.touch.y) : me.callbacks.touchDragging(me.touch.x, me.touch.y);
            }
        }
    
        touchendHandle(e) {
            var me = this;

            if (me.dragging &&
                e.targetTouches.length > 0 &&
                e.targetTouches[0].identifier == me.touch.identifier) {
                return;
            }
    
            me.lastTouchEndTime = new Date();
            window.removeEventListener('touchmove', me.touchmoveHandler);
            window.removeEventListener('touchend', me.touchendHandler);
            window.removeEventListener('touchcancel', me.touchendHandler);
    
            if (me.dragging) {
                me.dragging = false;
                (me.longpressed) ?  me.callbacks.longpressDragEnd() : me.callbacks.touchDragEnd();
            } else if (me.pinching) {
                me.pinching = false;
                me.hypo = undefined;
                me.callbacks.pinchEnd()
            } else if (!me.longpressed) {
                // TAP DETECTION
                if (me.taps == 0) me.callbacks.tap(me.touch.x, me.touch.y);
    
                // DOUBLE TAP DETECTION
                me.taps++;
                window.setTimeout(function () {
                    if (me.taps > 1) me.callbacks.doubleTap(me.touch.x, me.touch.y);
                    me.taps = 0;
                }, DOUBLE_TAP_DELAY);
            }

            me.longpressed = false;
        }
    }

    return Gestures;
}));