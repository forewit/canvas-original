import { Entity } from "./entity.js";
import { loadImage } from "../modules/utils.js";
export class Sprite extends Entity {
    constructor(url) {
        super();
        this.frameW = 0; // width of a single frame
        this.frameH = 0; // height of a single frame
        this.frameX = 0; // x position of the current frame
        this.frameY = 0; // y position of the current frame
        this.image = null;
        this.isLoaded = false;
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
    }
    // next horizontal frame
    nextFrame(startX, endX) {
        if (this.frameX + this.frameW >= endX) {
            this.frameX = startX;
        }
        else {
            this.frameX += this.frameW;
        }
    }
    duplicate() {
        let sprite = new Sprite(this.image.src);
        sprite.setFrame(this.frameX, this.frameY, this.frameW, this.frameH);
        return sprite;
    }
    destroy() { this.image = null; }
    render(board) {
        if (!this.isLoaded)
            return;
        // draw current frame
        let ctx = board.ctx;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image, this.frameX, this.frameY, this.frameW, this.frameH, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    }
}
