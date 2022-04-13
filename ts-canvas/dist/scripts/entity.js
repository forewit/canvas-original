import { pointInRotatedRectangle } from "../modules/utils.js";
export class Entity {
    constructor(x, y, w, h, angle) {
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
    get layer() { return this._layer; }
    set x(x) { this._x = x; this.isUpdated = true; }
    set y(y) { this._y = y; this.isUpdated = true; }
    set w(w) { this._w = w; this.isUpdated = true; }
    set h(h) { this._h = h; this.isUpdated = true; }
    set angle(angle) { this._angle = angle % (2 * Math.PI); this.isUpdated = true; }
    set layer(layer) {
        // check if entity is already in this layer
        if (this.layer === layer)
            return;
        // remove entity from old layer
        if (this.layer)
            this.layer.entities.splice(this.layer.entities.indexOf(this), 1);
        // add entity to new layer
        if (layer)
            layer.entities.push(this);
        this._layer = layer;
    }
    isIntersectingPoint(x, y) {
        return pointInRotatedRectangle(x, y, this.x, this.y, this.w, this.h, this.angle);
    }
    destroy() { this.layer = null; }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    ;
    render(board) { console.error("Entity.render() not implemented."); }
    ;
}
