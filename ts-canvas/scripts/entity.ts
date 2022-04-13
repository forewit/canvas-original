import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { pointInRotatedRectangle } from "../modules/utils.js";

export class Entity {
    /*
    A rectangle is defined by it's center, width, and height, and angle in radians
             w
    ┌─────────────────┐
    │                 │
    │       *(x, y)   | h
    │                 |
    └─────────────────┘
    */

    private _x: number;
    private _y: number;
    private _w: number;
    private _h: number;
    private _angle: number; // radians
    private _layer: Layer;
    protected isUpdated = true;

    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get w(): number { return this._w; }
    get h(): number { return this._h; }
    get angle(): number { return this._angle; }
    get layer(): Layer { return this._layer; }

    set x(x: number) { this._x = x; this.isUpdated = true; }
    set y(y: number) { this._y = y; this.isUpdated = true; }
    set w(w: number) { this._w = w; this.isUpdated = true; }
    set h(h: number) { this._h = h; this.isUpdated = true; }
    set angle(angle: number) { this._angle = angle % (2 * Math.PI); this.isUpdated = true; }
    set layer(layer: Layer) {
        // check if entity is already in this layer
        if (this.layer === layer) return;
        
        // remove entity from old layer
        if (this.layer) this.layer.entities.splice(this.layer.entities.indexOf(this), 1);
        
        // add entity to new layer
        if (layer) layer.entities.push(this);
        this._layer = layer;
    }

    constructor(x: number, y: number, w: number, h: number, angle?: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.angle = angle || 0;
    }

    isIntersectingPoint(x: number, y: number): boolean {
        return pointInRotatedRectangle(x, y, this.x, this.y, this.w, this.h, this.angle);
    }
    destroy(): void { this.layer = null; }

    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; };
    render(board: Board): void { console.error("Entity.render() not implemented.") };
}