import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { loadImage } from "../modules/utils.js";

export class Sprite extends Entity {
    static DEFAULT_FPS = 30;

    private frameW = 0; // width of a single frame
    private frameH = 0; // height of a single frame
    private frameX = 0; // x position of the current frame
    private frameY = 0; // y position of the current frame
    private image: HTMLImageElement = null;
    private isLoaded = false;
    private isAnimating = false;
    private animationLastFrameX = 0; // this is set when an animation is played

    // used for animation loop
    private interval = 1000 / Sprite.DEFAULT_FPS;
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

    // set the frame horizontally and vertically
    setFrame(frameX: number, frameY: number, frameW: number, frameH: number): void {
        this.frameX = frameX;
        this.frameY = frameY;
        this.frameW = frameW;
        this.frameH = frameH;
        this.isAnimating = false;
    }

    animate(numberOfFrames: number, fps?: number): void {
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

    duplicate(): Entity {
        let sprite = new Sprite(this.image.src, this.x, this.y, this.w, this.h, this.angle);
        sprite.setFrame(this.frameX, this.frameY, this.frameW, this.frameH);
        return sprite;
    }

    destroy(): void { this.image = null; }

    render(board: Board): void {
        if (!this.isLoaded) return;

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