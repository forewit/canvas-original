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
        this.handleSize = 10;
    }
    intersects(pointX, pointY) {

    }
    onHandle(x, y) {
        /* returns [x, y] where x or y can be -1, 0, or 1. Examples:
        * [-1, 0] is the Left edge
        * [1, 1] is the bottom right corner
        * [0, 0] not on handle
        */
        let handles = [0,0];

        let localPoint = utils.rotatePoint(this.x, this.y, x, y, this.rotation);
        let localX = localPoint[0];
        let localY = localPoint[1];

        let outerX = this.x - this.handleSize;
        let outerY = this.y - this.handleSize;
        let outerW = this.w + this.handleSize * 2;
        let outerH = this.h + this.handleSize * 2;

        // return if point is outside the outer rect
        if (!utils.pointInRectangle(localX, localY, outerX, outerY, outerW, outerH)) return;


        let innerX = this.x + this.handleSize;
        let innerY = this.y + this.handleSize;
        let innerW = this.w - this.handleSize * 2;
        let innerH = this.h - this.handleSize * 2;

        // return if point is inside the inner rect
        if (utils.pointInRectangle(localX, localY, innerX, innerY, innerW, innerH)) return;

        // check which handle it is in
        if (localX <= innerX) handles[0] = -1;
        else if (localX >= innerX + innerW) handles[0] = 1;

        if (localY <= innerY) handles[1] = -1;
        else if (localY >= innerY + innerH) handles[1] = 1;
        console.log("Inside handle area", handles);



    }
    destroy() { console.log("Please override entity.destroy()!") }
    render(ctx) {
        ctx.beginPath();
        ctx.rect(0, 0, this.w, this.h);
        ctx.rect(-this.handleSize, -this.handleSize, this.w + this.handleSize * 2, this.h + this.handleSize * 2);
        ctx.rect(this.handleSize, this.handleSize, this.w - this.handleSize * 2, this.h - this.handleSize * 2);
        ctx.stroke()
    }

    // TODO: add resize and rotate functions
}