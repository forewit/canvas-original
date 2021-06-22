/**
 * module to enable keyboard inputs. Shortcuts are combinations
 * of keycodes where the last key pressed is the last key in 
 * the shortcut. Find keycodes here: https://keycode.info/
 * 
 * keys.on(shortcut, callback)      adds a callback to a shortcut. Example:
 *                                      keys.on('17 65', (event)=>{console.log('ctrl + a', event)})
 * keys.off(shortcut)               removes the callback for a shortcut
 * keays.clear()                    clears all callbacks
 * keys.start()                     starts tracking key presses
 * keys.stop()                      stops tracking key presses
 * keys.down                        lists all keys that are currently pressed
 */

 (function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.keys = {}));
}(this, (function (exports) {
    'use strict';

    // tracking state
    // find keycodes here: https://keycode.info/
    let listening = {};
    let down = {};

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
    function clear() { listening = {}; }

    function keydownHandler(e) {
        // include to prevent key events while composing text
        if (e.isComposing || e.keyCode === 229) { return; }

        // add key code to down[]
        down[e.keyCode] = true;

        // check all keys we are listening to
        for (const [shortcut, callback] of Object.entries(listening)) {
            let keyCodes = shortcut.split(' ');

            // make sure the last key pressed is the last one in the shortcut
            if (keyCodes.pop() != e.keyCode) break;

            // make sure all the shortcut keys are down
            if (!keyCodes.every(keyCode => down[keyCode])) break;

            callback(e);
            return;
        }
    }

    function keyupHandler(e) { down[e.keyCode] = false; }
    function blurHandler(e) { down = {}; }

    exports.on = on;
    exports.off = off;
    exports.clear = clear;
    exports.start = start;
    exports.stop = stop;
    exports.down = down;

    Object.defineProperty(exports, '__esModule', { value: true });
})));