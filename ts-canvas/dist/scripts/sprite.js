import { Entity } from "./entity.js";
import { loadImage } from "../modules/utils.js";
export class Sprite extends Entity {
    constructor(url, x, y, w, h, angle) {
        super(x, y, w, h, angle);
        this.frameW = 0; // width of a single frame
        this.frameH = 0; // height of a single frame
        this.frameX = 0; // x position of the current frame
        this.frameY = 0; // y position of the current frame
        this.image = null;
        this.isLoaded = false;
        this.isAnimating = false;
        this.animationLastFrameX = 0; // this is set when an animation is played
        // used for animation loop
        this.interval = 1000 / Sprite.DEFAULT_FPS;
        this.start = 0;
        this.previous = 0;
        // load image
        loadImage(url).then(image => {
            this.image = image;
            this.isLoaded = true;
        });
    }
    // set the frame horizontally and vertically
    setFrame(frameX, frameY, frameW, frameH) {
        this.frameX = frameX;
        this.frameY = frameY;
        this.frameW = frameW;
        this.frameH = frameH;
        this.isAnimating = false;
    }
    animate(numberOfFrames, fps) {
        // only animate if a frame has been set
        if (this.isAnimating) {
            console.error("Sprite.animate() called while already animating.");
            return;
        }
        this.animationLastFrameX = this.frameX + numberOfFrames * this.frameW;
        this.interval = 1000 / (fps || Sprite.DEFAULT_FPS);
        this.start = performance.now();
        this.previous = this.start;
        this.isAnimating = true;
    }
    duplicate() {
        let sprite = new Sprite(this.image.src, this.x, this.y, this.w, this.h, this.angle);
        sprite.setFrame(this.frameX, this.frameY, this.frameW, this.frameH);
        return sprite;
    }
    destroy() { this.image = null; }
    render(board) {
        if (!this.isLoaded)
            return;
        // goto next frame if animating
        if (this.isAnimating) {
            let now = performance.now();
            if (now - this.previous >= this.interval) {
                this.frameX = (this.frameX + this.frameW) % this.animationLastFrameX;
                this.previous = now;
            }
        }
        // draw current frame
        let ctx = board.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.frameX, this.frameY, this.frameW, this.frameH, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}
Sprite.DEFAULT_FPS = 30;
