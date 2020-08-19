let me = {
    downKeys: {},
    start: function (canvas) {
        me.canvas = canvas;
        window.addEventListener('keydown', keydownHandler, { passive: false });
        window.addEventListener('keyup', keyupHandler);
        window.addEventListener('wheel', wheelHandler);
        window.addEventListener('blur', blurHandler);
    },
    stop: function () {
        window.removeEventListener('keydown', keydownHandler);
        window.removeEventListener('keyup', keyupHandler);
        window.removeEventListener('wheel', wheelHandler);
        window.removeEventListener('blur', blurHandler);
    }
};

// https://keycode.info/
let keyCodes = {
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


let zoomIntensity = 0.1;
let originx = 0;
let originy = 0;
let scale = 1;
function wheelHandler(event) {

    //event.preventDefault();
    // Get mouse offset.
    let mousex = event.clientX - me.canvas.elm.offsetLeft;
    let mousey = event.clientY - me.canvas.elm.offsetTop;
    // Normalize wheel to +1 or -1.
    let wheel = event.deltaY < 0 ? 1 : -1;

    // Compute zoom factor.
    let zoom = Math.exp(wheel*zoomIntensity);
    
    // Translate so the visible origin is at the context's origin.
    me.canvas.ctx.translate(originx, originy);
  
    // Compute the new visible origin. Original ly the mouse is at a
    // distance mouse/scale from the corner, we want the point under
    // the mouse to remain in the same place after the zoom, but this
    // is at mouse/new_scale away from the corner. Therefore we need to
    // shift the origin (coordinates of the corner) to account for this.
    originx -= mousex/(scale*zoom) - mousex/scale;
    originy -= mousey/(scale*zoom) - mousey/scale;
    
    // Scale it (centered around the origin due to the trasnslate above).
    me.canvas.ctx.scale(zoom, zoom);
    // Offset the visible origin to it's proper position.
    me.canvas.ctx.translate(-originx, -originy);

    // Update scale and others.
    scale *= zoom;
    //visibleWidth = width / scale;
    //visibleHeight = height / scale;
}

function keydownHandler(e) {
    // include to prevent key events while composing text
    if (e.isComposing || e.keyCode === 229) { return; }

    // add key code to downKeys[]
    me.downKeys[e.keyCode] = true;

    // Ctrl + A
    if (e.keyCode == keyCodes.A && me.downKeys[keyCodes.Control]) {
        console.log("Ctrl + A");
    }

    // Ctrl + S
    else if (e.keyCode == keyCodes.S && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        console.log("Interupted page save");
        e.preventDefault();
    }

    // F5 or Ctrl + R
    else if (e.keyCode == keyCodes.F5 ||
        (e.keyCode == keyCodes.R && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey))) {
        console.log("Interupted page reload");
        e.preventDefault();
    }

    // Space
    else if (e.keyCode == keyCodes.Space) { }

    // Right
    else if (e.keyCode == keyCodes.Right) {
        me.canvas.ctx.translate(-10,0);
    }

    // Left
    else if (e.keyCode == keyCodes.Left) {
        me.canvas.ctx.translate(10,0);
    }

    // Up
    else if (e.keyCode == keyCodes.Up) {
        me.canvas.ctx.translate(0,10);
    }

    // Down
    else if (e.keyCode == keyCodes.Down) {
        me.canvas.ctx.translate(0,-10);
    }

    // PageUp                         
    else if (e.keyCode == keyCodes.PageUp) { }

    // PageDown
    else if (e.keyCode == keyCodes.PageDown) { }
}

function keyupHandler(e) { me.downKeys[e.keyCode] = false; /* Do something */ }

export { me as keys };