// preferences

// tracking state
let _listening = {};

export let keys = {
    down: {},
    on: on,
    off: off,
    start: start,
    stop: stop
}

function start() {
    window.addEventListener('keydown', keydownHandler, { passive: false });
    window.addEventListener('keyup', keyupHandler);
    window.addEventListener('blur', blurHandler);
}

function stop() {
    window.removeEventListener('keydown', keydownHandler);
    window.removeEventListener('keyup', keyupHandler);
    window.removeEventListener('blur', blurHandler);
}

function on(keycodes, callback) { _listening[keycodes] = callback; }
function off(keycodes) { delete _listening[keycodes]; }

function keydownHandler(e) {
    // include to prevent key events while composing text
    if (e.isComposing || e.keyCode === 229) { return; }

    // add key code to keys.down[]
    keys.down[e.keyCode] = true;

    // check all keys we are listening to
    for (const [shortcut, callback] of Object.entries(_listening)) {
        let keycodes = shortcut.split(' ');

        let doCallback = true;
        keycodes.forEach(function(keycode){
            if (!keys.down[keycode]) doCallback = false;
        });

        if (doCallback) {
            callback(e);
            return;
        }
    }
}

function keyupHandler(e) { keys.down[e.keyCode] = false; }
function blurHandler(e) { keys.down = {}; }