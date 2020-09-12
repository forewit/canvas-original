import { Entity } from "./entity.js";
import * as utils from "./utils.js";

export class Sprite extends Entity {
    constructor(url) {
        super(); // call entity class constructor

        this.image = utils.getImage(url);
        this.frame_w = 512;
        this.frame_h = 512;
        this.frame_x = 0;
        this.frame_y = 0;
        this.sx = 0;
        this.sy = 0;
    }

    get frame_x() { return this._frame_x; }
    get frame_y() { return this._frame_y; }
    get frame_w() { return this._frame_w; }
    get frame_h() { return this._frame_h; }

    set frame_x(newFrameX) { this.updated = true; this._frame_x = newFrameX; }
    set frame_y(newFrameY) { this.updated = true; this._frame_y = newFrameY; }
    set frame_w(newFrameW) { this.updated = true; this._frame_w = newFrameW; }
    set frame_h(newFrameH) { this.updated = true; this._frame_h = newFrameH; }

    destroy() {

    }

    render(ctx) {
        if (this.updated) {
            this.sx = this.frame_x * this.frame_w;
            this.sy = this.frame_y * this.frame_h;
        } 
        this.updated = false;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(this.image, 
            this.sx, this.sy, 
            this.frame_w, this.frame_h, 
            0, 0, 
            this.w, this.h);

        ctx.rotate(-this.rotation);
        ctx.translate(-this.x, -this.y);
    }
}