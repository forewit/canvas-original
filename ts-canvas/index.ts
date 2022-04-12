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
fireball.animate(512, 512, true,
    { x: 0, y: 0, delay: 100 },
    { x: 512, y: 0, delay: 200 },
    { x: 1024, y: 0, delay: 300 },
    { x: 1536, y: 0, delay: 400 },
    { x: 2048, y: 0, delay: 500 },
    { x: 2560, y: 0, delay: 600 },
);
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

