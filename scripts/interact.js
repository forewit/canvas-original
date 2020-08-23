import { Pointer } from "./pointer.js";
import { Keys } from "./keys.js";
import { Entity } from "./entity.js";

let handle = new Entity()
handle.on = function(x,y) {
    /* returns [x, y] where x or y can be -1, 0, or 1. Examples:
        * [-1, 0] is the Left edge
        * [1, 1] is the bottom right corner
        * [] intersects but not on handle
        * undefined -0
        */
       let activeHandles = [];

       let localPoint = utils.rotatePoint(this.x, this.y, x, y, this.rotation);
       let localX = localPoint[0];
       let localY = localPoint[1];

       let outerX = this.x - this.handleSize;
       let outerY = this.y - this.handleSize;
       let outerW = this.w + this.handleSize * 2;
       let outerH = this.h + this.handleSize * 2;

       // return if point is outside the outer rect
       if (!utils.pointInRectangle(localX, localY, outerX, outerY, outerW, outerH)) return undefined;


       let innerX = this.x + this.handleSize;
       let innerY = this.y + this.handleSize;
       let innerW = this.w - this.handleSize * 2;
       let innerH = this.h - this.handleSize * 2;

       // return if point is inside the inner rect
       if (utils.pointInRectangle(localX, localY, innerX, innerY, innerW, innerH)) return activeHandles;

       activeHandles = [0,0];
       // check left and right handles
       if (localX <= innerX) activeHandles[0] = -1;
       else if (localX >= innerX + innerW) activeHandles[0] = 1;
       
       // check top and bottom handles
       if (localY <= innerY) activeHandles[1] = -1;
       else if (localY >= innerY + innerH) activeHandles[1] = 1;
       return activeHandles;
}