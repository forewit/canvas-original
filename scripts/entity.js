import * as utils from "./utils.js";

export class Entity {
    constructor() {
        this.ID = utils.generate_ID();

        // (x, y) is the entity's center point
        this.x = 200;
        this.y = 100;
        this.w = 128;
        this.h = 128;
        this.rotation = 1.2; // degrees
        this.handleSize = 5;
    }
    intersects(x, y) {
        let localPoint = utils.rotatePoint(this.x, this.y, x, y, this.rotation);
        return utils.pointInRectangle(localPoint[0], localPoint[1], this.x, this.y, this.w, this.h,);
    }

    destroy() { console.log("Please override entity.destroy()!") }
    render(ctx) {

        // show handle areas
        ctx.beginPath();
        ctx.rect(0, 0, this.w, this.h);
        ctx.rect(-this.handleSize, -this.handleSize, this.w + this.handleSize * 2, this.h + this.handleSize * 2);
        ctx.rect(this.handleSize, this.handleSize, this.w - this.handleSize * 2, this.h - this.handleSize * 2);
        ctx.stroke()
    }
}