import { Entity } from "./entity.js";
import { loadImage } from "../modules/utils.js";
;
export class Sprite extends Entity {
    constructor(url, x, y, w, h, angle) {
        super(x, y, w, h, angle);
        this.image = null;
        this.isLoaded = false;
        this.frameX = 0;
        this.frameY = 0;
        this.frameW = 0;
        this.frameH = 0;
        this.frameSet = [];
        this.isAnimating = false;
        this.looping = false;
        this.frameIndex = 0;
        this.start = 0;
        this.previous = 0;
        // load image
        loadImage(url).then(image => {
            this.image = image;
            this.isLoaded = true;
        });
    }
    animate(frameW, frameH, looping, ...frames) {
        this.frameW = frameW;
        this.frameH = frameH;
        this.looping = looping;
        this.frameSet = frames;
        this.frameIndex = 0;
        this.isAnimating = true;
        this.start = performance.now();
        this.previous = this.start;
    }
    setFrame(x, y, w, h) {
        this.frameX = x;
        this.frameY = y;
        this.frameW = w;
        this.frameH = h;
        this.isAnimating = false;
    }
    duplicate() {
        let sprite = new Sprite(this.image.src, this.x, this.y, this.w, this.h, this.angle);
        if (this.isAnimating)
            sprite.animate(this.frameW, this.frameH, this.looping, ...this.frameSet);
        return sprite;
    }
    destroy() { this.image = null; }
    render(board) {
        if (!this.isLoaded)
            return;
        // update frame
        if (this.isAnimating) {
            // get time since last frame
            let now = performance.now();
            let delta = now - this.previous;
            // if enough time has passed, go to next frame
            if (delta >= this.frameSet[this.frameIndex].delay) {
                this.previous = now;
                this.frameIndex = (this.frameIndex + 1) % this.frameSet.length;
                this.frameX = this.frameSet[this.frameIndex].x;
                this.frameY = this.frameSet[this.frameIndex].y;
            }
            // stop if we've reached the end and we're not looping
            if (!this.looping && this.frameIndex == this.frameSet.length - 1)
                this.isAnimating = false;
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
