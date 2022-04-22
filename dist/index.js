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
let fireball = new Sprite("images/fireball.png", { x: 100, y: 100, w: 128, h: 128 });
let layer = new Layer();
let board = new Board(document.getElementById("board"));
let noteElm = document.createElement("textarea");
noteElm.classList.add("entity");
let note = new Note(noteElm, { x: 0, y: 0, w: 100, h: 100 });
fireball.animate(512, 512, -1, 15, { x: 0, y: 0 }, { x: 512, y: 0 }, { x: 1024, y: 0 }, { x: 1536, y: 0 }, { x: 2048, y: 0 }, { x: 2560, y: 0 });
board.add(layer, note, fireball);
board.play(() => {
    note.rad += 0.01;
});
board.tool("select");
