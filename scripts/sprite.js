import * as utils from "./utils.js";

export class Sprite {
    constructor(URL) {
        this.ID = utils.generate_ID();
        this.image = new Image(URL);
        this.x = 0;
        this.y = 0;1
        this.z = 0;
        this.scale_x = 0.5;
        this.scale_y = 0.5;
        this.rotation = 0; // in radians
        this.opacity = 1;
        this.frame_w = 512;
        this.frame_h = 512;
        this.frame_x = 0;
        this.frame_y = 0;
    }

    render(ctx) {
       ctx.drawImage(this.URL)
    }
}