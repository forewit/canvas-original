
export class Draggable {
    static noop() { };

    static copyTouch(touch) {
        return { identifier: touch.identifier, x: touch.clientX, y: touch.clientY };
    }

    constructor(element, options) {
        var me = this;
        if (!options) options = {};
        let noop = function(){};

        // set public attributes
        me.elm = element;
        me.pointer = {};
        me.handle = (options.handle) ? options.handle : me.elm;
        me.handlers = {
            onStart: (options.onStart) ? options.onStart : noop,
            onMove: (options.onMove) ? options.onMove : noop,
            onEnd: (options.onEnd) ? options.onEnd : noop
        };
        me.placeholder = document.createElement("div");
        //me.placeholder.style.display = "none";
        if (options.placeholderClass) me.placeholder.classList.add(options.placeholderClass);

        // set private attributes
        me._state = {};
        me._dragging = false;
        me._startHandler = function(e) { me.startHandler(e) };
        me._moveHandler = function(e) { me.moveHandler(e) };
        me._endHandler = function(e) { me.endHandler(e) };

        // add event listeners
        me.handle.addEventListener('touchstart', me._startHandler, { passive: false });
        me.handle.addEventListener('mousedown', me._startHandler);
    }

    startHandler(e) {
        var me = this;

        // add event listeners
        if (me._dragging) return;
        if (e.type === 'mousedown') {
            window.addEventListener('mousemove', me._moveHandler, { passive: false });
            window.addEventListener('mouseup', me._endHandler);
            me.pointer = { x: e.clientX, y: e.clientY };
        } else {
            me.handle.addEventListener('touchmove', me._moveHandler, { passive: false });
            me.handle.addEventListener('touchend', me._endHandler);
            me.handle.addEventListener('touchcancel', me._endHandler);
            me.pointer = Draggable.copyTouch(e.targetTouches[0]);
            e.preventDefault();
            e.stopPropagation();
        }

        // set initial state
        let rect = me.elm.getBoundingClientRect();
        me._state = {
            x: rect.x - me.pointer.x,       // adjusted for starting mouse x
            y: rect.y - me.pointer.y,       // adjusted for starting mouse y
        };

        // start dragging
        me.elm.after(me.placeholder);       // insert placeholder
        document.body.appendChild(me.elm);  // move elm to body
        me.elm.style.position = "absolute";
        me.updatePosition();                // update so that position includes mouse offset

        // callback
        me.handlers.onStart(me, me.pointer.x, me.pointer.y);

        // cleanup
        me._dragging = true;
        // prevent iFrames from stealing pointer events
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.pointerEvents = "none";
        }
    }

    moveHandler(e) {
        var me = this;

        // update pointer
        me.pointer = (e.type == 'mousemove')
            ? { x: e.clientX, y: e.clientY }
            : Draggable.copyTouch(e.targetTouches[0]);

        e.preventDefault();
        e.stopPropagation();

        // update element position
        me.updatePosition();

        // callback
        me.handlers.onMove(me, me.pointer.x, me.pointer.y);
    }

    endHandler(e) {
        var me = this;

        // remove event listeners
        if (e.type === 'mouseup') {
            window.removeEventListener('mousemove', me._moveHandler);
            window.removeEventListener('mouseup', me._endHandler);
        } else if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != me.pointer.identifier) {
            me.handle.removeEventListener('touchmove', me._moveHandler);
            me.handle.removeEventListener('touchend', me._endHandler);
            me.handle.removeEventListener('touchcancel', me._endHandler);
        } else {
            return;
        }

        // restore state
        me.placeholder.after(me.elm);
        me.placeholder.remove();
        me.elm.style.position = "";
        
        // callback
        me.handlers.onEnd(me);

        // cleanup
        me._dragging = false;
        // allow iframes to steal pointer events again
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.pointerEvents = "auto";
        }
    }

    updatePosition() {
        this.elm.style.left = this._state.x + this.pointer.x + 'px';
        this.elm.style.top = this._state.y + this.pointer.y + 'px';
    }
}