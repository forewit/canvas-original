import * as utils from './modules/utils.js';
import { Board } from './scripts/board.js';
import { Sprite } from './scripts/sprite.js';
import { Layer } from './scripts/layer.js';

utils.log("Hello World! 👋", { bold: true });



// update notch on orientation change
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();

// create objects for the game
let board = new Board(<HTMLCanvasElement>document.getElementById("board"));
let layer = new Layer();
let fireball = new Sprite("images/fireball.png", 200, 100, 128, 128)

// configure the game
fireball.setFrame(0, 0, 512, 512);
fireball.animate(6, 2);
layer.entities.push(fireball);
board.layers.push(layer);

// start the game
let start = performance.now(),
    previous = start,
    ticks = 0,
    FPS = 0;

board.play(() => {
    // do stuff
    fireball.angle += 0.002;

    // ******* FPS COUNTER *********
    let now = performance.now(),
        delta = now - previous;

    if (delta >= 1000) {
        previous = now;
        FPS = ticks;
        ticks = 0;
    }
    ticks++;

    if (delta >= 200) document.getElementById("fps").innerHTML = FPS.toString();
    // *****************************
});

