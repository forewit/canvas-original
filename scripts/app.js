import { Canvas } from "./canvas.js";
import { Layer } from "./layer.js";
import { Sprite } from "./sprite.js";
import { Toolbar } from "./toolbar.js";
import { keys } from "./keys.js";
import { gestures } from "./gestures.js";


(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.gg = {}));
}(this, (function (exports) {
    'use strict';

    // Create test canvas and toolbar
    let toolbar = new Toolbar(document.getElementById("toolbar"), true);
    let canvas = new Canvas(document.getElementById("canvas"));
    let layer = new Layer();
    let sprite = new Sprite("/img/fireball.png");

    // resizing canvas
    window.addEventListener("resize", function () { canvas.resize() });
    canvas.addLayer(layer);
    layer.addEntity(sprite);

    // keyboard detection
    keys.on('17 82', function (e) {
        e.preventDefault();
        console.log('Prevented reload!');
    });
    keys.start();


    let log = document.getElementById('log');
    let log2 = document.getElementById('log2');
    // touch detection
    gestures.on('tap', point => log.innerHTML= 'tap');
    gestures.on('doubleTap', point => log.innerHTML= 'doubleTap');
    gestures.on('longPress', point => log.innerHTML= 'longPress');
    gestures.on('touchDragStart', point => log.innerHTML= 'touchDragStart');
    gestures.on('touchDragging', point => log.innerHTML= 'touchDragging');
    gestures.on('touchDragEnd', point => log.innerHTML= 'touchDragEnd');
    gestures.on('pinching', (point, delta) => log2.innerHTML = delta);

    // mouse detection
    gestures.on('click', point => log.innerHTML= 'click');
    gestures.on('doubleClick', point => log.innerHTML= 'doubleClick');
    gestures.on('rightClick', point => log.innerHTML= 'rightClick');
    gestures.on('longClick', point => log.innerHTML= 'longClick');
    gestures.on('wheel', (point, delta) => log.innerHTML= 'wheel');
    gestures.on('mouseDragStart', point => log.innerHTML= 'mouseDragStart');
    gestures.on('mouseDragging', point => log.innerHTML= 'mouseDragging');
    gestures.on('mouseDragEnd', point => log.innerHTML= 'mouseDragEnd');

    gestures.start(canvas.elm);

    // ************ app loop **************
    var FPS = 0;
    var ticks = 0;
    var lastFPS = 0;
    var fps_div = document.getElementById("fps");

    function loop(delta) {
        requestAnimationFrame(loop);
        var perSec = delta / 1000;

        // DO STUFF
        canvas.render();
        sprite.frame_x = Math.floor(10 * perSec % 6);

        // FPS counter
        var now = Date.now();
        if (now - lastFPS >= 1000) {
            lastFPS = now;
            FPS = ticks;
            ticks = 0;
        }
        ticks++;
        fps_div.innerHTML = FPS;
    }
    requestAnimationFrame(loop);
    // ************************************

    // Global exports
    exports.canvas = canvas;

    Object.defineProperty(exports, '__esModule', { value: true });
})));