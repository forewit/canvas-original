import { Dndcanvas } from "./dndcanvas.js";
import { Layer } from "./layer.js";
import { Sprite } from "./sprite.js";
import { interact } from "./interact.js";

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = global || self, factory(global.gg = {}));
}(this, (function (exports) {
    'use strict';

    // Create test canvas and toolbar
    let dndcanvas = new Dndcanvas(document.getElementById("canvas"));
    let layer = new Layer();
    let sprite = new Sprite("/img/placeholder.png");
    sprite.rotation = 1;
    sprite.x = 200;
    sprite.y = 100;
    sprite.w = 128;
    sprite.h = 64;

    let sprite2 = new Sprite("/img/placeholder.png");
    sprite2.x = 300;
    sprite2.y = 300;
    sprite2.w = 64;
    sprite2.h = 64;

    // resizing canvas
    window.addEventListener("resize", function () { dndcanvas.resize() });
    layer.addEntity(sprite);
    layer.addEntity(sprite2);

    dndcanvas.addLayer(layer);
    dndcanvas.activeLayer = layer;

    interact(dndcanvas);

    // ************ app loop **************
    var FPS = 0;
    var ticks = 0;
    var lastFPS = 0;
    var fps_div = document.getElementById("fps");

    function loop(delta) {
        requestAnimationFrame(loop);
        var perSec = delta / 1000;

        // DO STUFF
        dndcanvas.render();
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
    exports.dndcanvas = dndcanvas;
    exports.utils = utils;

    Object.defineProperty(exports, '__esModule', { value: true });
})));