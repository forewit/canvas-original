import { generate_ID, rotatePoint, pointInRect } from "../modules/utils.js";
export class Entity {
    constructor(x, y, w, h, rad) {
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
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rad = rad || 0;
    }
    // getters
    get w() { return this._w; }
    get h() { return this._h; }
    get rad() { return this._rad; }
    get topLeft() {
        return rotatePoint(this.x - this.w / 2, this.y - this.h / 2, this.x, this.y, this.rad);
    }
    // setters
    set w(w) { this._w = w; }
    set h(h) { this._h = h; }
    set rad(rad) { this._rad = rad % (2 * Math.PI); }
    isIntersectingPoint(x, y) {
        return pointInRect(x, y, this.x, this.y, this.w, this.h, this.rad);
    }
    destroy() { console.error("Entity.destroy() not implemented."); }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    ;
    render(board) { console.error("Entity.render() not implemented."); }
    ;
}
