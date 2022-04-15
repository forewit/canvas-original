import * as utils from './modules/utils.js';
import { Board } from './scripts/board.js';
import { Sprite } from './scripts/sprite.js';
import { Layer } from './scripts/layer.js';

utils.log("Hello World! 👋", { bold: true });



// update notch on orientation change
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();

// create objects for the game
let fireball = new Sprite("images/fireball.png", 100, 100, 128, 128);
fireball.animate(512, 512, -1, 15,
    { x: 0, y: 0 },
    { x: 512, y: 0 },
    { x: 1024, y: 0 },
    { x: 1536, y: 0 },
    { x: 2048, y: 0 },
    { x: 2560, y: 0 },
);

let snake = new Sprite("images/snake_right.png", 150, 150, 128, 128);
snake.opacity = 0.5;
snake.animate(128, 128, -1, 15,
    { x: 0, y: 0 },
    { x: 128, y: 0 },
    { x: 256, y: 0 },
    { x: 384, y: 0 },
    { x: 0, y: 128 },
    { x: 128, y: 128 },
    { x: 256, y: 128 },
    { x: 384, y: 128 },
    { x: 0, y: 256 },
    { x: 128, y: 256 },
    { x: 256, y: 256 },
    { x: 384, y: 256 },
    { x: 0, y: 384 },
    { x: 128, y: 384 },
    { x: 256, y: 384 },
    { x: 384, y: 384 },
);

// setup board
let layer = new Layer();
let board = new Board(<HTMLCanvasElement>document.getElementById("board"));
board.add(layer, fireball, snake);
board.tool("select");


// start the game
let start = performance.now(),
    previous = start,
    ticks = 0,
    FPS = 0;

board.play(() => {
    // do stuff

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