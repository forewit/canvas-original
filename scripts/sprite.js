import { Entity } from "./entity.js";

export class Sprite extends Entity {
    constructor(URL) {
        super(); // call entity class constructor

        this.image = new Image();
        this.frame_w = 512;
        this.frame_h = 512;
        this.frame_x = 0;
        this.frame_y = 0;
        this.isLoaded = false;
        this.sx = 0;
        this.sy = 0;

        // initialize image
        var me = this;
        me.image.src = URL;
        me.image.onload = function () { me.isLoaded = true; }
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
        if (!this.isLoaded) return;

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