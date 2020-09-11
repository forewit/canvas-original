import * as utils from "./utils.js";

export class Entity {
    constructor() {
        this.ID = utils.generate_ID();

        // (x, y) is the entity's center point
        this._x = 200;
        this._y = 100;
        this._w = 128;
        this._h = 128;
        this._rotation = 0;
        this.updated = true;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get w() { return this._w; }
    get h() { return this._h; }
    get rotation() { return this._rotation; }

    set x(newx) { this._x = newx; this.updated = true; }
    set y(newy) { this._y = newy; this.updated = true; }
    set w(neww) { this._w = neww; this.updated = true; }
    set h(newh) { this._h = newh; this.updated = true; }
    set rotation(newRotation) { this._rotation = newRotation; this.updated = true; }

    intersects(x, y) {
        let localPoint = utils.rotatePoint(this._x, this._y, x, y, this._rotation);
        return utils.pointInRectangle(localPoint[0], localPoint[1], this._x, this._y, this._w, this._h);
    }
    destroy() { console.log("Please override entity.destroy()!") }
    render(ctx) { }
}