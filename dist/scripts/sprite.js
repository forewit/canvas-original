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
        this.frames = [];
        this.frameIndex = 0;
        this.repeat = 0;
        this.interval = 0;
        this.previous = 0;
        // load image
        loadImage(url).then(image => {
            this.image = image;
            this.isLoaded = true;
        });
    }
    // repeat = -1 for infinite looping
    // repeat = 0 for no looping
    animate(frameW, frameH, repeat, fps, ...frames) {
        if (frames.length == 0)
            return;
        this.frameW = frameW;
        this.frameH = frameH;
        this.repeat = repeat;
        this.frames = frames;
        this.frameIndex = 0;
        this.interval = 1000 / fps;
        this.previous = performance.now();
    }
    // override 
    duplicate() {
        let sprite = new Sprite(this.image.src, this.rect.x, this.rect.y, this.rect.w, this.rect.h, this.rad);
        if (this.frames.length > 0)
            sprite.animate(this.frameW, this.frameH, this.repeat, 1000 / this.interval, ...this.frames);
        return sprite;
    }
    // override
    destroy() {
        this.image = null;
        this.frames = [];
    }
    // override
    render(board) {
        super.render(board);
        if (!this.isLoaded || this.frames.length == 0)
            return;
        if (this.repeat != 0) {
            let now = performance.now();
            // if enough time has passed, go to next frame
            if (now - this.previous > this.interval) {
                if (++this.frameIndex >= this.frames.length)
                    this.frameIndex = 0;
                this.frameX = this.frames[this.frameIndex].x;
                this.frameY = this.frames[this.frameIndex].y;
                this.previous = now;
                if (this.frameIndex == this.frames.length - 1)
                    this.repeat--;
            }
        }
        // draw current frame
        let ctx = board.ctx;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.rect.x, this.rect.y);
        ctx.rotate(this.rad);
        ctx.drawImage(this.image, this.frameX, this.frameY, this.frameW, this.frameH, -this.rect.w / 2, -this.rect.h / 2, this.rect.w, this.rect.h);
        ctx.restore();
    }
}
