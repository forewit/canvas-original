import { generate_ID, pointInRect } from "../modules/utils.js";
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
        this.outline = false;
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
    render(board) {
        // draw outline
        if (this.outline) {
            board.ctx.save();
            board.ctx.translate(this.x, this.y);
            board.ctx.rotate(this.rad);
            board.ctx.strokeStyle = "blue";
            board.ctx.lineWidth = 1;
            board.ctx.strokeRect(-this.w / 2, -this.h / 2, this.w, this.h);
            board.ctx.restore();
        }
    }
    ;
}
