export class Entity {
    constructor() {
        /*
        An entity's origin is at the center
                 w
        ┌─────────────────┐
        │                 │
        │       *(x, y)   | h
        │                 |
        └─────────────────┘
        */
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._angle = 0; // radians
        this.isUpdated = true;
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
    isIntersecting(x, y) {
        // assuming pivot is in the center 
        // TODO: pointInRotatedRectangle(x, y, this.x-this.w/2, this.y-this.h/2, this.w/2, this.h/2, this.w, this.h, this.angle);
        return false;
    }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    render(board) { console.error("Entity.render() not implemented."); }
    ;
    destroy() { console.error("Entity.destroy() not implemented."); }
}
