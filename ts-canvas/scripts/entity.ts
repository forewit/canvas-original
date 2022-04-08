import { Board } from "./board.js";
import { pointInRectangle, rotatePoint, pointInRotatedRectangle } from "../modules/utils.js";

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
    private _x = 0;
    private _y = 0; 
    private _w = 0;
    private _h = 0;
    private _angle = 0; // radians
    protected isUpdated = true;

    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get w(): number { return this._w; }
    get h(): number { return this._h; }
    get angle(): number { return this._angle; }

    set x(x: number) { this._x = x; this.isUpdated = true; }
    set y(y: number) { this._y = y; this.isUpdated = true; }
    set w(w: number) { this._w = w; this.isUpdated = true; }
    set h(h: number) { this._h = h; this.isUpdated = true; }
    set angle(angle: number) { this._angle = angle % (2 * Math.PI); this.isUpdated = true; }

    isIntersectingPoint(x: number, y: number): boolean {
        return pointInRotatedRectangle(x, y, this.x, this.y, this.w, this.h, this.angle);
    }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; }
    render(board: Board): void { console.error("Entity.render() not implemented.") };
    destroy(): void { console.error("Entity.destroy() not implemented.") }
}