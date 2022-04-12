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
    private isAnimating = false;
    private looping = false;
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

    animate(frameW: number, frameH: number, looping: boolean, ...frames: Frame[]): void {
        this.frameW = frameW;
        this.frameH = frameH;
        this.looping = looping;
        this.frameSet = frames;
        this.frameIndex = 0;
        this.isAnimating = true;
        this.start = performance.now();
        this.previous = this.start;
    }

    setFrame(x: number, y: number, w: number, h: number): void {
        this.frameX = x;
        this.frameY = y;
        this.frameW = w;
        this.frameH = h;
        this.isAnimating = false;
    }

    duplicate(): Entity {
        let sprite = new Sprite(this.image.src, this.x, this.y, this.w, this.h, this.angle);
        if (this.isAnimating) sprite.animate(this.frameW, this.frameH, this.looping, ...this.frameSet);
        return sprite;
    }

    destroy(): void { this.image = null; }

    render(board: Board): void {
        if (!this.isLoaded) return;
        
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
            if (!this.looping && this.frameIndex == this.frameSet.length - 1) this.isAnimating = false;
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