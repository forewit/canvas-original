import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { loadImage } from "../modules/utils.js";

interface Frame {x: number, y: number};

export class Sprite extends Entity {
    private image: HTMLImageElement = null;
    private isLoaded = false;
    private frameX = 0;
    private frameY = 0;
    private frameW = 0;
    private frameH = 0;
    private frames: Frame[] = [];
    private frameIndex = 0;
    private repeat = 0;
    private interval = 0;
    private previous = 0;

    constructor(url: string, x: number, y: number, w: number, h: number, angle?: number) {
        super(x, y, w, h, angle);

        // load image
        loadImage(url).then(image => {
            this.image = image;
            this.isLoaded = true;
        });
    }

    // repeat = -1 for infinite looping
    // repeat = 0 for no looping
    animate(frameW: number, frameH: number, repeat: number, fps: number, ...frames: Frame[]): void {
        if (frames.length == 0) return;

        this.frameW = frameW;
        this.frameH = frameH;
        this.repeat = repeat;
        this.frames = frames;
        this.frameIndex = 0;
        this.interval = 1000 / fps;
        this.previous = performance.now();
    }

    // override 
    duplicate(): Entity {
        let sprite = new Sprite(this.image.src, this.rect.x, this.rect.y, this.rect.w, this.rect.h, this.rect.rad);
        if (this.frames.length > 0) 
            sprite.animate(this.frameW, this.frameH, this.repeat, 1000/this.interval, ...this.frames);
        return sprite;
    }

    // override
    destroy(): void { 
        this.image = null;
        this.frames = [];
    }

    // override
    render(board: Board): void {
        super.render(board);

        if (!this.isLoaded || this.frames.length == 0 || !this.enabled) return;

        if (this.repeat != 0) {
            let now = performance.now();

            // if enough time has passed, go to next frame
            if (now - this.previous > this.interval) {                
                if (++this.frameIndex >= this.frames.length) this.frameIndex = 0;

                this.frameX = this.frames[this.frameIndex].x;
                this.frameY = this.frames[this.frameIndex].y;

                this.previous = now;
                if (this.frameIndex == this.frames.length - 1) this.repeat--;
            }
        }

        // draw current frame
        let ctx = board.ctx;
        ctx.save();
        ctx.translate(this.rect.x, this.rect.y);
        ctx.rotate(this.rect.rad);
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.image, this.frameX, this.frameY, this.frameW, this.frameH, -this.rect.halfw, -this.rect.halfh, this.rect.w, this.rect.h);
        ctx.restore();
    }
}