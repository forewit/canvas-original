
export class Draggable {
    static noop() { };

    static copyTouch(touch) {
        return { identifier: touch.identifier, x: touch.clientX, y: touch.clientY };
    }

    constructor(element, options) {
        var me = this;
        if (!options) options = {};

        let noop = function(){};
        me.el = element;
        me.pointer = {};
        me.handle = (options.handle) ? options.handle : me.el;
        me.handlers = {
            onStart: (options.onStart) ? options.onStart : noop,
            onMove: (options.onMove) ? options.onMove : noop,
            onEnd: (options.onEnd) ? options.onEnd : noop
        };

        me._dimensions = {};
        me._parent = me.el.parentNode;
        me._dragging = false;
        me._startHandler = function(e) { me.startHandler(e) };
        me._moveHandler = function(e) { me.moveHandler(e) };
        me._endHandler = function(e) { me.endHandler(e) };

        me.handle.addEventListener('touchstart', me._startHandler, { passive: false });
        me.handle.addEventListener('mousedown', me._startHandler);
    }

    startHandler(e) {
        var me = this;
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

        var rect = me.el.getBoundingClientRect();
        me._dimensions = {
            x: rect.left - me.pointer.x,
            y: rect.top - me.pointer.y,
            width: me.el.style.width,
            height: me.el.style.height,
            zIndex: me.el.style.zIndex
        };

        document.body.appendChild(me.el);
        me.el.style.width = rect.width + 'px';
        me.el.style.height = rect.height + 'px';
        me.el.style.zIndex = 1000;

        me.updatePosition();
        me.handlers.onStart(me, me.pointer.x, me.pointer.y);

        me._dragging = true;

        // prevent iFrames from stealing pointer events
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.pointerEvents = "none";
        }
    }

    moveHandler(e) {
        var me = this;
        me.pointer = (e.type == 'mousemove')
            ? { x: e.clientX, y: e.clientY }
            : Draggable.copyTouch(e.targetTouches[0]);

        e.preventDefault();
        e.stopPropagation();
        me.updatePosition();
        me.handlers.onMove(me, me.pointer.x, me.pointer.y);
    }

    endHandler(e) {
        var me = this;
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

        me._parent.appendChild(me.el);
        me.el.style.width = me._dimensions.width;
        me.el.style.height = me._dimensions.height;
        me.el.style.zIndex = me._dimensions.zIndex;
        me.el.style.top = parseInt(me.el.style.top, 10) + me._parent.scrollTop + 'px';
        
        me.handlers.onEnd(me);

        me._dragging = false;

        // allow iframes to steal pointer events again
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.pointerEvents = "auto";
        }
    }

    updatePosition() {
        this.el.style.left = this._dimensions.x + this.pointer.x + 'px';
        this.el.style.top = this._dimensions.y + this.pointer.y + 'px';
    }
}