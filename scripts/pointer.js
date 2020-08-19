export class Pointer {
    static copyTouch(touch) {
        return {
            identifier: touch.identifier,
            x: touch.clientX,
            y: touch.clientY
        }
    }

    constructor(elm) {
        let noop = function () { };
        this.elm = elm;

        // Callback functions
        this.tap = noop;
        this.longPress = noop;
        this.dragStart = noop;
        this.dragging = noop;
        this.dragStop = noop;
        this.doubleTap = noop;
        this.pinch = noop;
        this.rotate = noop;
        this.rightClick = noop;

        // preferences
        this.longPressDelay = 100; // delay (ms) before long press

        // private variables
        this._start = 0;
        this._moving = false;
    }

    start() {
        let me = this;
        me.elm.addEventListener('touchstart', me.startHandler, { passive: false });
        me.elm.addEventListener('mousedown', me.startHandler, { passive: false });
    }
    stop() {
        let me = this;
        me.elm.removeEventListener('touchstart', me.startHandler);
        me.elm.removeEventListener('mousedown', me.startHandler);
    }

    startHandler(e) {
        let me = this;

        // TODO: check for rght-clicks
        if (e.which === 3) { return; }

        me._start = Date.now();
        me._moving = false;

        if (e.type === 'mousedown') {
            window.addEventListener('mousemove', me.moveHandler, { passive: false });
            window.addEventListener('mouseup', me.endHandler);
            me.pointer = { x: e.clientX, y: e.clientY };
        } else {
            window.addEventListener('touchmove', me.moveHandler, { passive: false });
            window.addEventListener('touchend', me.endHandler);
            window.addEventListener('touchcancel', me.endHandler);
            me.pointer = copyTouch(e.targetTouches[0]);
        }
        e.preventDefault();
        e.stopPropagation();
    }

    moveHandler(e) {
        let me = this;

        if (e.type == 'mousemove') {
            me.pointer = { x: e.clientX, y: e.clientY };
            /////////////////////////
            // TODO: handle mouse drag
            /////////////////////////
        } else {
            me.pointer = copyTouch(e.targetTouches[0]);
            e.preventDefault();
            e.stopPropagation();
            /////////////////////////
            // TODO: handle touch drag
            /////////////////////////
        }
        me._moving = true;
    }

    endHandler(e) {
        let me = this;
        if (e.type === 'mouseup') {
            window.removeEventListener('mousemove', me.moveHandler);
            window.removeEventListener('mouseup', me.endHandler);
            /////////////////////////
            // TODO: handle mouse up
            /////////////////////////
        } else if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != me.pointer.identifier) {
            window.removeEventListener('touchmove', me.moveHandler);
            window.removeEventListener('touchend', me.endHandler);
            window.removeEventListener('touchcancel', me.endHandler);
            /////////////////////////
            // TODO: handle touch end
            /////////////////////////
        }

    }
}