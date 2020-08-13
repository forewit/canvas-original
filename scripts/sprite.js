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

        // initialize image
        var me = this;
        me.image.src = URL;
        me.image.onload = function () { me.isLoaded = true; }
    }
    destroy() {

    }
    render(ctx) {
        if (!this.isLoaded) return;

        // TODO: add checks for this.updated
        let sx = this.frame_x * this.frame_w,
            sy = this.frame_y * this.frame_h;

        ctx.drawImage(this.image,
            sx, sy, this.frame_w, this.frame_h, // frame position and scale
            this.x, this.y, this.w, this.h);    // canvas position and scale
    }
}