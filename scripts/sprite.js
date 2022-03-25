// Sprites are used to draw images or animations as Enities.
import { Entity } from "./entity.js";

export class Sprite extends Entity {
    constructor(url) {
        super(); // Entity class constructor

        this._frame_w = 512; // Width of a single frame
        this._frame_h = 512; // Height of a single frame
        this._frame_x = 0; // Iterates by 1 for each horizontal frame
        this._frame_y = 0; // Iterates by 1 for each vertical frame
        this.sx = 0; // "Scaled x" is the current frame x offset 
        this.sy = 0; // "Scaled y" is the current frame y offset
        this.loaded = false;
        
        var me = this;
        files.getImageFromURL(url, (img) => {
            me.image = img;
            me.loaded = true;
        });
    }

    get frame_x() { return this._frame_x; }
    get frame_y() { return this._frame_y; }
    get frame_w() { return this._frame_w; }
    get frame_h() { return this._frame_h; }

    set frame_x(newFrameX) { this.updated = true; this._frame_x = newFrameX; }
    set frame_y(newFrameY) { this.updated = true; this._frame_y = newFrameY; }
    set frame_w(newFrameW) { this.updated = true; this._frame_w = newFrameW; }
    set frame_h(newFrameH) { this.updated = true; this._frame_h = newFrameH; }

    _render(ctx) {
        // Sprites should always render because will be cleared each frame by the Board
        if (!this.loaded) return;
        
        if (this.updated) {
            this.sx = this.frame_x * this.frame_w;
            this.sy = this.frame_y * this.frame_h;
            this.updated = false;
        }

        ctx.save()
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        ctx.rect(-this.halfw, -this.halfh, this.w, this.h);
        ctx.stroke();
        ctx.drawImage(this.image,
            this.sx, this.sy,
            this.frame_w, this.frame_h,
            -this.halfw, -this.halfh,
            this.w, this.h);

        ctx.restore()
    }
}