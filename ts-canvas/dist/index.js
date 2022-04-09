import * as utils from './modules/utils.js';
import { Board } from './scripts/board.js';
import { Sprite } from './scripts/sprite.js';
import { Layer } from './scripts/layer.js';
utils.log("Hello World!", { olor: "green", bold: true });
// update notch on orientation change
window.addEventListener('orientationchange', utils.setNotchCssProperties);
utils.setNotchCssProperties();
// create objects for the game
let board = new Board(document.getElementById("board"));
let layer = new Layer();
let fireball = new Sprite("images/fireball.png");
// configure the game
fireball.setFrame(0, 0, 512, 512);
fireball.x = 100;
fireball.y = 100;
fireball.w = 100;
fireball.h = 100;
layer.entities.push(fireball);
board.layers.push(layer);
// ********** render loop ************
let fpsInterval, startTime, then, elapsed, now;
function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
}
function animate() {
    requestAnimationFrame(animate);
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) {
        then = now - (elapsed % fpsInterval);
        // do something
        board.render();
        fireball.nextFrame(0, 3072);
    }
}
startAnimating(10);
// ************************************
utils.log("Goodbye 👋", { olor: "green", bold: true });
