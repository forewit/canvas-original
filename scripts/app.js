import { Board } from "./Board.js";
import { Layer } from "./layer.js";
import { Sprite } from "./sprite.js";
import { Note } from "./note.js";
import Interact from "./interact.js";



// Create a couple Sprites
let placeholderSprite = new Sprite("/img/placeholder.png");
placeholderSprite.x = 200;
placeholderSprite.y = 100;
placeholderSprite.w = 128;
placeholderSprite.h = 64;

let fireballSprite = new Sprite("/img/fireball.png");
fireballSprite.x = 300;
fireballSprite.y = 300;
fireballSprite.w = 64;
fireballSprite.h = 64;
fireballSprite.frame_w = 512;
fireballSprite.frame_h = 512;

let noteElm = document.createElement("textarea");
noteElm.classList.add("note");

let myNote = new Note(noteElm);
myNote.w = 100;
myNote.h = 100;
myNote.x = 500;
myNote.y = 100;

// create a layer for the sprites to live on
let layer = new Layer();
layer.addEntity(placeholderSprite);
layer.addEntity(fireballSprite);
layer.addEntity(myNote);

// create a board for the layer to exist on
let board = new Board(document.getElementById("board"));
board.addLayer(layer);
board.activeLayer = layer;
Interact.start(board);

// ************ app loop **************
var FPS = 0;
var ticks = 0;
var lastFPS = 0;
var fps_div = document.getElementById("fps");

function loop(delta) {
    requestAnimationFrame(loop);
    var perSec = delta / 1000;

    // DO STUFF
    board.render();
    placeholderSprite.rotation = perSec;
    fireballSprite.frame_x = Math.floor(10 * perSec % 6);

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