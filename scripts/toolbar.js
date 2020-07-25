import { Draggable } from "./draggable.js";
//REQUIRES: scroll.js util


export class Toolbar {
    constructor(element, horizontal) {
        var me = this;

        // set public attributes
        me.elm = element;
        me.horizontal = !!horizontal;   // default false (vertical)
        me.dropZone = 10;               // size of the valid drop area
        me.items = [];

        // Initialize el children as items in the list
        for (var i = 0; i < me.elm.children.length; i++) {
            let child = me.elm.children[i];
            if (child.classList.contains("toolbar-item")) {
                let options = {
                    onEnd: function (item) { me.onRelease(item) },
                    onStart: function (item) { me.onGrab(item) },
                    onMove: function (item, x, y) { me.onDrag(item, x, y) },
                    placeholderClass: "toolbar-item"
                }
                let item = new Draggable(child, options);
                me.items.push(item);
            }
        }
    }

    onGrab(item) {
        // remove from items array
        var itemIndex = this.items.indexOf(item);
        this.items.splice(itemIndex, 1);
    }

    onDrag(item, x, y) {
        // check if item is over a drop zone in the toolbar
        let inDropZone = false;
        for (var i = 0, len = this.items.length; i < len; i++) {
            let rect = this.items[i].elm.getBoundingClientRect();

            if (this.horizontal) {
                // check horizontal drop zones
                if (x < rect.x + this.dropZone + rect.width / 2 &&
                    x > rect.x - this.dropZone + rect.width / 2) {
                        inDropZone = true;
                }
            } else {
                // check vertical drop zones
                if (y < rect.y + this.dropZone + rect.height / 2 &&
                    y > rect.y - this.dropZone + rect.height / 2) {
                        inDropZone = true;
                }
            }
        }

        // move placeholder to drop zone
        if (!inDropZone) return;
        console.log("in drop zone");
    }

    onRelease(item) {
        // re-add to items array
        this.items.push(item);
    }
}


export class ToolbarOLD {
    constructor(element) {
        var me = this;

        me.el = element;
        me.items = [];
        me.gap = 10;

        me._left = me.el.clientLeft;
        me._width = me.el.clientWidth;
        me._dropZones = [];

        // create placeholder element
        me.placeholder = document.createElement('div');
        me.placeholder.classList.add('placeholder', 'toolbar-item');

        // Initialize el children as items in the list
        for (var i = 0; i < me.el.children.length; i++) {
            let child = me.el.children[i];
            if (child.classList.contains("toolbar-item")) {
                let options = {
                    onEnd: function (item) { me.onRelease(item) },
                    onStart: function (item) { me.onGrab(item) },
                    onMove: function (item, x, y) { me.onDrag(item, x, y) }
                }
                let item = new Draggable(child, options);
                me.items.push(item);
            }
        }
        me.updatePositions();
    }

    inDropZone(x, y, scrollOffset, above, below) {
        return (x < this._left + this._width &&
            y > scrollOffset - above / 2 &&
            y < scrollOffset + below / 2);
    }

    updatePositions(gap) {
        var newZone = 0;
        this._dropZones = [newZone];
        for (var i in this.items) {
            newZone += this.items[i].el.clientHeight + this.gap;
            this._dropZones.push(newZone);

            var top = (i > 0) ? top + this.items[i - 1].el.clientHeight + (gap || 0) : (gap || 0);

            this.items[i].el.style.left = this._left + 'px';
            this.items[i].el.style.top = top + 'px';

            if (gap == null) this.items[i].el.style.marginBottom = '0px';
            else this.items[i].el.style.marginBottom = gap + 'px';
        }
    }

    // called by drag.js
    onGrab(item) {
        // remove item
        var itemIndex = this.items.indexOf(item);
        this.items.splice(itemIndex, 1);
        this.updatePositions(this.gap);
        item.position = item.el.style.position;
        item.el.style.position = "absolute";

        // insert placeholder
        this.placeholder.index = itemIndex;
        this.placeholder.style.top = this._dropZones[itemIndex] + 'px';
        this.el.appendChild(this.placeholder);
    }

    // called by drag.js
    onDrag(item, x, y) {
        if (this.items.length == 0) {
            return;
        } else { // update the placeholder            
            // check first drop zone
            if (this.placeholder.index != 0 &&
                this.inDropZone(
                    x, y,
                    this._dropZones[0] - this.el.scrollTop,
                    -1000,
                    this.items[0].el.clientHeight)) {
                this.placeholder.style.top = this._dropZones[0] + 'px';
                this.placeholder.index = 0;
                this.el.scrollTop = 0;
                return;
            }
            // check middle drop zones
            for (var i = 1; i < this.items.length; i++) {
                if (this.placeholder.index != i &&
                    this.inDropZone(
                        x, y,
                        this._dropZones[i] - this.el.scrollTop,
                        this.items[i - 1].el.clientHeight,
                        this.items[i].el.clientHeight)) {
                    this.placeholder.style.top = this._dropZones[i] + 'px';
                    this.placeholder.index = i;
                    if (y < 0 || y > this.el.clientHeight) {
                        this.placeholder.scrollIntoView();
                    }
                    return;
                }
            }
            // check last drop zone
            if (this.placeholder.index != this.items.length &&
                this.inDropZone(
                    x, y,
                    this._dropZones[this._dropZones.length - 1] - this.el.scrollTop,
                    this.items[this.items.length - 1].el.clientHeight,
                    1000)) {
                this.placeholder.style.top = this._dropZones[this._dropZones.length - 1] + 'px';
                this.placeholder.index = this.items.length;
                this.el.scrollTop = this.el.scrollHeight;
                return;
            }
        }
    }

    // called by drag.js
    onRelease(item) {
        // add item to list
        this.items.splice(this.placeholder.index, 0, item);
        item.el.style.position = item.position;

        // update positions
        this.updatePositions();

        // remove placeholder
        this.el.removeChild(this.placeholder);
    }
};