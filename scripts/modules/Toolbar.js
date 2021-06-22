
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.Toolbar = factory();
    }
}(this, function () {
    'use strict';

    class Toolbar {
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
            item.elm.classList.add("dragging");
        }

        onDrag(item, x, y) {
            // check if item is over a drop zone in the toolbar
            for (var i = 0, len = this.items.length; i < len; i++) {
                let hoverElm = this.items[i].elm;
                let hoverElmRect = hoverElm.getBoundingClientRect();

                if (this.horizontal) {
                    // check horizontal drop zones
                    if (x < hoverElmRect.x + this.dropZone + hoverElmRect.width / 2 &&
                        x > hoverElmRect.x - this.dropZone + hoverElmRect.width / 2) {

                        // TODO: this section introduces errors
                        let placeholderRect = item.placeholder.getBoundingClientRect();
                        if (hoverElmRect.x > placeholderRect.x) {
                            // move placeholder after the hoverElm
                            hoverElm.after(item.placeholder);
                            return;
                        } else {
                            // move placeholder before the hoverElm
                            this.elm.insertBefore(item.placeholder, hoverElm);
                            return;
                        }
                    }
                } else {
                    // check vertical drop zones
                    if (y < hoverElmRect.y + this.dropZone + hoverElmRect.height / 2 &&
                        y > hoverElmRect.y - this.dropZone + hoverElmRect.height / 2) {

                        let placeholderRect = item.placeholder.getBoundingClientRect();
                        if (hoverElmRect.y > placeholderRect.y) {
                            // insert placeholder after the hoverElm
                            hoverElm.after(item.placeholder);
                            return;
                        } else {
                            // insert placeholder before the hoverElm
                            this.elm.insertBefore(item.placeholder, hoverElm);
                            return;
                        }
                    }
                }
            }
        }

        onRelease(item) {
            // re-add to items array
            this.items.push(item);
            item.elm.classList.remove("dragging");
        }
    }

    return Toolbar;
}));