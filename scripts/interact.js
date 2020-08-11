/**
 * TODO: create a new repository in Github for a standalone
 * interaction model.
 */
var me = {
    selected: [],
    pointer: {},
    downKeys: {},
    start: function (canvas) {
        me.canvas = canvas;
        me.selected = [];
        canvas.elm.addEventListener('touchstart', startHandler, { passive: false });
        canvas.elm.addEventListener('mousedown', startHandler, { passive: false });
        window.addEventListener('keydown', keydownHandler, { passive: false });
        window.addEventListener('keyup', keyupHandler);
        window.addEventListener('wheel', wheelHandler);
        window.addEventListener('blur', blurHandler);
    },
    stop: function () {
        me.selected = [];
        canvas.elm.removeEventListener('touchstart', startHandler);
        canvas.elm.removeEventListener('mousedown', startHandler);
        window.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('keyup', keyupHandler);
        window.removeEventListener('wheel', wheelHandler);
        window.removeEventListener('blur', blurHandler);
    }
};

var _longPressDelay = 200; // delay (ms) before long press
var _start = 0; // touch down start time
var _moving = false;
var _selectbox = false;
var _onItem = false;
// https://keycode.info/
var _keys = {
    Shift: 16,
    Control: 17,
    Alt: 18,
    Meta: 91,
    Escape: 27,
    Space: 32,
    A: 65,
    R: 82,
    S: 83,
    F5: 116,
    Right: 39,
    Left: 37,
    Up: 38,
    Down: 40,
    PageDown: 34,
    PageUp: 33,
};

function blurHandler(e) {
    me.downKeys = {};
}

function wheelHandler(e) {
    if (e.deltaY < 0) {
        // scroll down
    } else {
        // scroll up
    }
}

function keydownHandler(e) {
    // include to prevent key events while composing text
    if (e.isComposing || e.keyCode === 229) { return; }

    // add key code to downKeys[]
    me.downKeys[e.keyCode] = true;

    // Ctrl + A
    if (e.keyCode == _keys.A && me.downKeys[_keys.Control]) {
        console.log("Ctrl + A");
    }

    // Ctrl + S
    else if (e.keyCode == _keys.S && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        console.log("Interupted page save");
        e.preventDefault();
    }

    // F5 or Ctrl + R
    else if (e.keyCode == _keys.F5 ||
        (e.keyCode == _keys.R && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))) {
        console.log("Interupted page reload");
        e.preventDefault();
    }

    // Space
    else if (e.keyCode == _keys.Space) { }

    // Right
    else if (e.keyCode == _keys.Right) {
        me.canvas._ctx.translate(-10,0);
    }

    // Left
    else if (e.keyCode == _keys.Left) {
        me.canvas._ctx.translate(10,0);
    }

    // Up
    else if (e.keyCode == _keys.Up) {
        me.canvas._ctx.translate(0,10);
    }

    // Down
    else if (e.keyCode == _keys.Down) {
        me.canvas._ctx.translate(0,-10);
    }

    // PageUp                         
    else if (e.keyCode == _keys.PageUp) { }

    // PageDown
    else if (e.keyCode == _keys.PageDown) { }
}

function keyupHandler(e) { me.downKeys[e.keyCode] = false; /* Do something */ }

// PRIVATE FUNCTIONS
function startHandler(e) {
    _start = Date.now();
    _moving = false;
    _selectbox = false;
    _onItem = false;

    if (e.type === 'mousedown') {
        window.addEventListener('mousemove', moveHandler, { passive: false });
        window.addEventListener('mouseup', endHandler);
        me.pointer = { x: e.clientX, y: e.clientY };
    } else {
        window.addEventListener('touchmove', moveHandler, { passive: false });
        window.addEventListener('touchend', endHandler);
        window.addEventListener('touchcancel', endHandler);
        me.pointer = copyTouch(e.targetTouches[0]);
    }
    e.preventDefault();
    e.stopPropagation();

    // ***** if pointer is on a selected object *****
    // this._onItem = true
}

function moveHandler(e) {
    if (e.type == 'mousemove') {
        me.pointer = { x: e.clientX, y: e.clientY };
        if (_onItem) {
            // ***** dragging items *****
            // move items
            console.log("moving item");
        } else if (_selectbox || (!_moving && (me.downKeys[_keys.Shift] || me.downKeys[_keys.Control]))) {
            _selectbox = true;
            // ***** shift(ctrl) + drag start *****
            // draw selectbox
            console.log("drawing selectbox");
        } else {
            // ***** drag start *****
            // pan
            console.log("panning");
        }
    } else {
        me.pointer = copyTouch(e.targetTouches[0]);
        e.preventDefault();
        e.stopPropagation();
        /////////////////////////
        //handle touch drag
        /////////////////////////
    }
    _moving = true;
}

function endHandler(e) {
    if (e.type === 'mouseup') {
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        if (_selectbox) {
            // ***** shift(ctrl) + drag release *****
            // add items in selectbox to selected
            console.log("selecting items in selectbox");
        } else if (!_moving) {
            if (!(me.downKeys[_keys.Shift] || me.downKeys[_keys.Control])) {
                // ***** click *****
                me.selected = [];
                //console.log("clearing selected");

            }
            // ***** click or shift(ctrl) + click *****
            // add item to selected
            //console.log("checking to add item to selected");
            // check intersection
        }
    } else if (e.targetTouches.length == 0 || e.targetTouches[0].identifier != me.pointer.identifier) {
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', endHandler);
        window.removeEventListener('touchcancel', endHandler);
        /////////////////////////
        //handle touch end
        /////////////////////////
    }
}

/**
 * TODO: interactions
 * Panning
 * Selection
 */

function copyTouch(touch) {
    return {
        identifier: touch.identifier,
        x: touch.clientX,
        y: touch.clientY
    };
}

/**
 * CONSTANTS
 * - tap_delay
 * 
 * ACTIONS
 * Add to selected TRIVIAL
 * draw select box (ax,ay,bx,by)
 * copy
 * paste
 * select all 
 * save
 * open search
 * clear selection TRIVIAL
 * pan(dx,dy)
 * zoom(amount)
*/

export { me as interact };