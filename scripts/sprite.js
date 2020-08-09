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

        // initialize image
        var me = this;
        me.image.src = URL;
        me.image.onload = function(e) {
            console.log("img loaded");
            me.loaded = true;
        }
    }

    destroy() {

    }
    render(ctx) {
        if (!this.loaded) return;

        ctx.drawImage(this.image, this.x, this.y);
    }
}