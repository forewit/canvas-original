
export class Draggable {
    static noop() { };

    static copyTouch(touch) {
        return { identifier: touch.identifier, x: touch.clientX, y: touch.clientY };
    }

    constructor(element, options) {
        if (!options) options = {};

        this.el = element;
        this.pointer = {};
        this.handle = (options.handle) ? options.handle : this.el;
        this.handlers = {
            onStart: (options.onStart) ? options.onStart : Draggable.noop,
            onMove: (options.onMove) ? options.onMove : Draggable.noop,
            onEnd: (options.onEnd) ? options.onEnd : Draggable.noop
        };

        this._dimensions = {};
        this._parent = this.el.parentNode;
        this._dragging = false;

        var me = this;
        me.handle.addEventListener('touchstart', function (e) { me.startHandler(e) }, { passive: false });
        me.handle.addEventListener('mousedown', function (e) { me.startHandler(e) });
    }


    startHandler(e) {
        var me = this;
        if (me._dragging) return;
        if (e.type === 'mousedown') {
            window.addEventListener('mousemove', function (e) { me.moveHandler(e) }, { passive: false });
            window.addEventListener('mouseup', function (e) { me.endHandler(e) });
            me.pointer = { x: e.clientX, y: e.clientY };
        } else {
            me.handle.addEventListener('touchmove', function (e) { me.moveHandler(e) }, { passive: false });
            me.handle.addEventListener('touchend', function (e) { me.endHandler(e) });
            me.handle.addEventListener('touchcancel', function (e) { me.endHandler(e) });
            me.pointer = Draggable.copyTouch(e.targetTouches[0]);
            e.preventDefault();
            e.stopPropagation();
        }

        var rect = this.el.getBoundingClientRect();
        this._dimensions = {
            x: rect.left - this.pointer.x,
            y: rect.top - this.pointer.y,
            width: this.el.style.width,
            height: this.el.style.height,
            zIndex: this.el.style.zIndex
        };

        document.body.appendChild(this.el);
        this.el.style.width = rect.width + 'px';
        this.el.style.height = rect.height + 'px';
        this.el.style.zIndex = 1000;

        this.updatePosition();
        this.handlers.onStart(me, me.pointer.x, me.pointer.y);

        this._dragging = true;

        // prevent iFrames from stealing pointer events
        var frames = document.getElementsByTagName('iframe');
        for (var i = 0; i < frames.length; i++) {
            frames[i].style.pointerEvents = "none";
        }
    }

    moveHandler(e) {
        var me = this;
        this.pointer = (e.type == 'mousemove')
            ? { x: e.clientX, y: e.clientY }
            : Draggable.copyTouch(e.targetTouches[0]);

        e.preventDefault();
        e.stopPropagation();
        this.updatePosition();
        this.handlers.onMove(me, me.pointer.x, me.pointer.y);
    }

    endHandler(e) {
        var me = this;
        if (e.type === 'mouseup') {
            window.removeEventListener('mousemove', function (e) { me.moveHandler(e) });
            window.removeEventListener('mouseup', function (e) { me.endHandler(e) });
        } else if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != me.pointer.identifier) {
            me.handle.removeEventListener('touchmove', function (e) { me.moveHandler(e) });
            me.handle.removeEventListener('touchend', function (e) { me.endHandler(e) });
            me.handle.removeEventListener('touchcancel', function (e) { me.endHandler(e) });
        } else {
            return;
        }

        this._parent.appendChild(this.el);
        this.el.style.width = this._dimensions.width;
        this.el.style.height = this._dimensions.height;
        this.el.style.zIndex = this._dimensions.zIndex;
        this.el.style.top = parseInt(this.el.style.top, 10) + this._parent.scrollTop + 'px';
        
        console.log(me);
        me.handlers.onEnd(me);

        this._dragging = false;

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