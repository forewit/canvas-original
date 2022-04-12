import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { loadImage } from "../modules/utils.js";

interface Frame {x: number, y: number, delay: number};

export class Sprite extends Entity {
    private image: HTMLImageElement = null;
    private isLoaded = false;
    private frameX = 0;
    private frameY = 0;
    private frameW = 0;
    private frameH = 0;
    private frameSet: Frame[] = [];
    private count = 0;
    private repeat = 0;
    private frameIndex = 0;
    private start = 0;
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
    animate(frameW: number, frameH: number, repeat: number, ...frames: Frame[]): void {
        this.frameW = frameW;
        this.frameH = frameH;
        this.count = 0;
        this.repeat = repeat;
        this.frameSet = frames;
        this.frameIndex = 0;
        this.start = performance.now();
        this.previous = this.start;
    }

    duplicate(): Entity {
        let sprite = new Sprite(this.image.src, this.x, this.y, this.w, this.h, this.angle);
        sprite.animate(this.frameW, this.frameH, this.repeat, ...this.frameSet);
        return sprite;
    }

    destroy(): void { this.image = null; }

    render(board: Board): void {
        if (!this.isLoaded) return;
        
        if (this.repeat == -1 || this.count < this.repeat) {
            // get time since last frame
            let now = performance.now();
            let delta = now - this.previous;

            // if enough time has passed, go to next frame
            if (delta >= this.frameSet[this.frameIndex].delay) {
                this.previous = now;
                this.frameIndex = (this.frameIndex + 1) % this.frameSet.length;

                this.frameX = this.frameSet[this.frameIndex].x;
                this.frameY = this.frameSet[this.frameIndex].y;

                if (this.frameIndex == this.frameSet.length - 1) this.count++;
                console.log(this.count);
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