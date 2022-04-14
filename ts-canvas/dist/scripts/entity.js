import { pointInRotatedRectangle, generate_ID } from "../modules/utils.js";
export class Entity {
    constructor(x, y, w, h, angle) {
        /*
        A rectangle is defined by it's center, width, and height, and angle in radians
                 w
        ┌─────────────────┐
        │                 │
        │       *(x, y)   | h
        │                 |
        └─────────────────┘
        */
        this.ID = generate_ID();
        this.opacity = 1;
        this.isUpdated = true;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.angle = angle || 0;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get w() { return this._w; }
    get h() { return this._h; }
    get angle() { return this._angle; }
    set x(x) { this._x = x; this.isUpdated = true; }
    set y(y) { this._y = y; this.isUpdated = true; }
    set w(w) { this._w = w; this.isUpdated = true; }
    set h(h) { this._h = h; this.isUpdated = true; }
    set angle(angle) { this._angle = angle % (2 * Math.PI); this.isUpdated = true; }
    isIntersectingPoint(x, y) {
        return pointInRotatedRectangle(x, y, this.x, this.y, this.w, this.h, this.angle);
    }
    destroy() { console.error("Entity.destroy() not implemented."); }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    ;
    render(board) { console.error("Entity.render() not implemented."); }
    ;
}
