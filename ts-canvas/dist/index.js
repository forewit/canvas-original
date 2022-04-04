import * as utils from './modules/utils.js';
import { Board } from './scripts/board.js';
utils.log("Hello World!", { olor: "green", bold: true });
// update notch on orientation change
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();
// create board
let board = new Board(document.getElementById("board"));
board._scale = 2;
// ********** render loop ************
var FPS = 0;
var ticks = 0;
var lastFPS = 0;
var fps_div = document.getElementById("fps");
function loop(delta) {
    requestAnimationFrame(loop);
    var perSec = delta / 1000;
    // DO STUFF
    board.render();
    // FPS counter
    var now = Date.now();
    if (now - lastFPS >= 1000) {
        lastFPS = now;
        FPS = ticks;
        ticks = 0;
    }
    ticks++;
    fps_div.innerHTML = FPS.toString();
}
requestAnimationFrame(loop);
// ************************************
utils.log("Goodbye 👋", { olor: "green", bold: true });
