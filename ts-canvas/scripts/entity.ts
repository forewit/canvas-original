import { Board } from "./board.js";
import { pointInRotatedRectangle } from "../modules/utils.js";

export class Entity {
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

    isIntersecting(x: number, y: number): boolean {
        // assuming pivot is in the center 
        return pointInRotatedRectangle(x, y, this.x, this.y, this.w/2, this.h/2, this.w, this.h, this.angle);
    }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; }
    render(board: Board): void { console.error("Entity.render() not implemented.") };
    destroy(): void { console.error("Entity.destroy() not implemented.") }
}