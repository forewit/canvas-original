import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { pointInRotatedRectangle, generate_ID } from "../modules/utils.js";

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
    readonly ID: string = generate_ID();

    opacity: number = 1;
    x: number;
    y: number;

    protected _w: number;
    protected _h: number;
    protected _angle: number; // radians

    get angle(): number { return this._angle; }
    get w(): number { return this._w; }
    get h(): number { return this._h; }

    set angle(angle: number) { this._angle = angle % (2 * Math.PI) }
    set w(w: number) { this._w = w; }
    set h(h: number) { this._h = h; }

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
    destroy(): void { console.error("Entity.destroy() not implemented.") }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; };
    render(board: Board): void { console.error("Entity.render() not implemented.") };
}