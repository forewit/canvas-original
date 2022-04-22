import { pointInRect, generate_ID } from "../modules/utils.js";
export class Entity {
    constructor(rect) {
        /*
        A rectangle is defined by it's corner, width, and height, and angle in radians.
        Angle should rotate around the CENTER of the rectangle.
                  w
        *─────────────────┐
        │ (x, y)          │
        │                 | h
        │                 |
        └─────────────────┘
        */
        this.ID = generate_ID();
        this.opacity = 1;
        this.rect = rect || { x: 0, y: 0, w: 0, h: 0, rad: 0 };
        if (this.rect.rad === undefined) {
            this.rect.rad = 0;
        }
    }
    get x() { return this.rect.x; }
    get y() { return this.rect.y; }
    get w() { return this.rect.w; }
    get h() { return this.rect.h; }
    get rad() { return this.rect.rad; }
    set x(x) { this.rect.x = x; }
    set y(y) { this.rect.y = y; }
    set w(w) { this.rect.w = w; }
    set h(h) { this.rect.h = h; }
    set rad(rad) { this.rect.rad = rad % (2 * Math.PI); }
    isIntersectingPoint(x, y) {
        return pointInRect(x, y, this.rect);
    }
    destroy() { console.error("Entity.destroy() not implemented."); }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    ;
    render(board) { console.error("Entity.render() not implemented."); }
    ;
}
