// tracking state
let listening = {};

export let keys = {
    down: {},
    on: on,
    off: off,
    start: start,
    stop: stop,
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

function on(keycodes, callback) { listening[keycodes] = callback; }
function off(keycodes) { delete listening[keycodes]; }

function keydownHandler(e) {
    // include to prevent key events while composing text
    if (e.isComposing || e.keyCode === 229) { return; }

    // add key code to keys.down[]
    keys.down[e.keyCode] = true;

    // check all keys we are listening to
    for (const [shortcut, callback] of Object.entries(listening)) {
        let keyCodes = shortcut.split(' ');

        // make sure the last key pressed is the last one in the shortcut
        if (keyCodes.pop() != e.keyCode) break;

        // make sure all the shortcut keys are down
        if (!keyCodes.every(keyCode => keys.down[keyCode])) break;
            
        callback(e);
        return;
    }
}

function keyupHandler(e) { keys.down[e.keyCode] = false; }
function blurHandler(e) { keys.down = {}; }