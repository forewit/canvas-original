import { Canvas } from "./canvas.js";
import { Layer } from "./layer.js";
import { Sprite } from "./sprite.js";
import { Toolbar } from "./toolbar.js";
import { interact } from "./interact.js";
import * as utils from "./utils.js";

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
    sprite.rotation = 1;
    sprite.x = 200;
    sprite.y = 100;
    sprite.w = 128;
    sprite.h = 128;

    // resizing canvas
    window.addEventListener("resize", function () { canvas.resize() });
    layer.addEntity(sprite);

    canvas.addLayer(layer);
    canvas.activeLayer = layer;

    interact.start(canvas);
    interact.setTool('pan');

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
        sprite.rotation += 0.01;
        //sprite.h += 0.5;
        //sprite.x += 1;

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
    exports.utils = utils;

    Object.defineProperty(exports, '__esModule', { value: true });
})));