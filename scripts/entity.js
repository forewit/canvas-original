import * as utils from "./utils.js";

export class Entity {
    constructor() {
        this.ID = utils.generate_ID();
        this.x = 200;
        this.y = 100;
        this.w = 128;
        this.h = 128;
        this.rotation = 1; // degrees
        this.opacity = 1;
        this.outline = true;
        this.update = false;
    }
    // credit: https://yal.cc/rot-rect-vs-circle-intersection/
    intersects(pointX, pointY) {
        let rectOffsetX = this.w/2;
        let rectOffsetY = this.h/2;
        let relX = pointX - this.x;
        let relY = pointY - this.y;
        let angle = -this.rotation;
        let angleCos = Math.cos(angle);
        let angleSin = Math.sin(angle);
        let localX = angleCos * relX - angleSin * relY;
        let localY = angleSin * relX + angleCos * relY;
        return localX >= -rectOffsetX && localX <= this.w - rectOffsetX &&
               localY >= -rectOffsetY && localY <= this.h - rectOffsetY;
    }
    destroy() {console.log("Please override entity.destroy()!")}
    render() {console.log("Please override entity.render()!")}

    // TODO: add resize and rotate functions
}