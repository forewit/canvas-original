import { Rect } from "./types.js";
import * as utils from "../modules/utils.js";

export class Entity {
    rect: Rect = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        angle: 0
    }
    _x = 0;
    _y = 0;
    _w = 0;
    _h = 0;
    _angle = 0; // radians
    isUpdated = true;

    private halfw = 0;
    private halfh = 0;

    get x(): number { return this._x; }
    get y(): number { return this._y; }
    get w(): number { return this._w; }
    get h(): number { return this._h; }
    get angle(): number { return this._angle; }

    set x(value: number) { this._x = value; this.isUpdated = true; }
    set y(value: number) { this._y = value; this.isUpdated = true; }
    set w(value: number) { this._w = value; this.halfw = value / 2; this.isUpdated = true; }
    set h(value: number) { this._h = value; this.halfh = value / 2; this.isUpdated = true; }
    set angle(value: number) { this._angle = value % (Math.PI * 2); this.isUpdated = true; }

    intersects(x: number, y: number): boolean { return false; }
    render(): void { };
    destroy(): void { };
}