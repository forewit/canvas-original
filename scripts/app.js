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


    let log = document.getElementById('log');
    let log2 = document.getElementById('log2');
    // touch detection
    pointer.on('tap', point => log.innerHTML= 'tap');
    pointer.on('doubleTap', point => log.innerHTML= 'doubleTap');
    pointer.on('longPress', point => log.innerHTML= 'longPress');
    pointer.on('touchDragStart', point => log.innerHTML= 'touchDragStart');
    pointer.on('touchDragging', point => log.innerHTML= 'touchDragging');
    pointer.on('touchDragEnd', point => log.innerHTML= 'touchDragEnd');
    pointer.on('pinching', (point, delta) => log2.innerHTML = delta);

    // mouse detection
    pointer.on('click', point => log.innerHTML= 'click');
    pointer.on('doubleClick', point => log.innerHTML= 'doubleClick');
    pointer.on('rightClick', point => log.innerHTML= 'rightClick');
    pointer.on('longClick', point => log.innerHTML= 'longClick');
    pointer.on('wheel', (point, delta) => log.innerHTML= 'wheel');
    pointer.on('mouseDragStart', point => log.innerHTML= 'mouseDragStart');
    pointer.on('mouseDragging', point => log.innerHTML= 'mouseDragging');
    pointer.on('mouseDragEnd', point => log.innerHTML= 'mouseDragEnd');

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