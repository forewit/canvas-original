import * as utils from "./utils.js";

export class Sprite {
    constructor(URL) {
        this.ID = utils.generate_ID();
        this.image = new Image();
        this.x = 0;
        this.y = 0;
        this.scale_x = 0.5;
        this.scale_y = 0.5;
        this.rotation = 0; // in radians
        this.opacity = 1;
        this.frame_w = 512;
        this.frame_h = 512;
        this.frame_x = 0;
        this.frame_y = 0;
        this.loaded = false;

        // can use for optimizing render function
        this.updated = true;

        // initialize image
        var me = this;
        me.image.src = URL;
        me.image.onload = function (e) { me.loaded = true; }
    }
    destroy() {

    }
    render(ctx) {
        if (!this.loaded) return;

        // TODO: add checks for this.updated
        let sx = this.frame_x * this.frame_w,
            sy = this.frame_y * this.frame_h,
            dWidth = this.frame_w * this.scale_x,
            dHeight = this.frame_h * this.scale_y;

        ctx.drawImage(this.image,
            sx, sy, this.frame_w, this.frame_h, // frame position and scale
            this.x, this.y, dWidth, dHeight);   // canvas position and scale
    }
}