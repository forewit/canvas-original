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
        let sprite = new Sprite(this.image.src, this.x, this.y, this.w, this.h, this.angle);
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
        if (!this.isLoaded || this.frames.length == 0) return;

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
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.frameX, this.frameY, this.frameW, this.frameH, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}