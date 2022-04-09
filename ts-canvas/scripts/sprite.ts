import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { loadImage } from "../modules/utils.js";

export class Sprite extends Entity {
    private frameW = 0; // width of a single frame
    private frameH = 0; // height of a single frame
    private frameX = 0; // x position of the current frame
    private frameY = 0; // y position of the current frame
    private image: HTMLImageElement = null;
    private isLoaded = false;

    constructor(url: string) {
        super();

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
    }

    // next horizontal frame
    nextFrame(startX: number, endX: number): void {
        if (this.frameX + this.frameW >= endX) {
            this.frameX = startX;
        } else {
            this.frameX += this.frameW;
        }
    }

    duplicate(): Entity { 
        let sprite = new Sprite(this.image.src);
        sprite.setFrame(this.frameX, this.frameY, this.frameW, this.frameH);
        return sprite;
    }

    destroy(): void { this.image = null; }

    render(board: Board): void {
        if (!this.isLoaded) return;

        // draw current frame
        let ctx = board.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.frameX, this.frameY, this.frameW, this.frameH, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}