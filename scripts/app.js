import { Canvas } from "./canvas.js";
import { Layer } from "./layer.js";
import { Sprite } from "./sprite.js";
import { Toolbar } from "./toolbar.js";
import { keys } from "./keys.js";
import { pointer } from "./pointer.js";


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

    // touch detection
    pointer.on('tap', point => console.log('tap', point));
    pointer.on('doubleTap', point => console.log('doubleTap', point));
    pointer.on('longPress', point => console.log('longPress', point));
    pointer.on('touchDragStart', point => console.log('touchDragStart', point));
    pointer.on('touchDragging', point => console.log('touchDragging'));
    pointer.on('touchDragEnd', point => console.log('touchDragEnd', point));
    pointer.on('pinch', point => console.log('pinch', point));

    // mouse detection
    pointer.on('click', point => console.log('click', point));
    pointer.on('doubleClick', point => console.log('doubleClick', point));
    pointer.on('rightClick', point => console.log('rightClick', point));
    pointer.on('longClick', point => console.log('longClick', point));
    pointer.on('wheel', point => console.log('wheel', point));
    pointer.on('mouseDragStart', point => console.log('mouseDragStart', point));
    pointer.on('mouseDragging', point => console.log('mouseDragging'));
    pointer.on('mouseDragEnd', point => console.log('mouseDragEnd', point));

    pointer.start(canvas.elm);

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