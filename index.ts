import * as utils from './modules/utils.js';
import { Board } from './scripts/board.js';
import { Sprite } from './scripts/sprite.js';
import { Note } from './scripts/note.js';
import { Layer } from './scripts/layer.js';

utils.log("Hello World! 👋", { bold: true });

// update notch on orientation change
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();

// create objects for the game
let fireball = new Sprite("images/fireball.png", 100, 100, 128, 128);
let snake = new Sprite("images/snake_right.png", 150, 150, 128, 128);
let layer = new Layer();
let board = new Board(<HTMLCanvasElement>document.getElementById("board"));

let noteElm = document.createElement("textarea");
noteElm.classList.add("entity");
let note = new Note(noteElm, 0, 0, 100, 100);

fireball.animate(512, 512, -1, 15,
    { x: 0, y: 0 },
    { x: 512, y: 0 },
    { x: 1024, y: 0 },
    { x: 1536, y: 0 },
    { x: 2048, y: 0 },
    { x: 2560, y: 0 },
);
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

board.add(layer, note);
board.play(() => {
    note.rad += 0.01;
});
board.tool("select");