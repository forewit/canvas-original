import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { generate_ID, rotatePoint, pointInRect } from "../modules/utils.js";

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
    protected _rad: number; // radians

    // getters
    get w(): number { return this._w; }
    get h(): number { return this._h; }
    get rad(): number { return this._rad; }
    get topLeft(): {x: number, y: number} {
        return rotatePoint(this.x - this.w / 2, this.y - this.h / 2, this.x, this.y, this.rad);
    }

    // setters
    set w(w: number) { this._w = w; }
    set h(h: number) { this._h = h; }
    set rad(rad: number) { this._rad = rad % (2 * Math.PI) }


    constructor(x: number, y: number, w: number, h: number, rad?: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.rad = rad || 0;
    }

    isIntersectingPoint(x: number, y: number): boolean {
        return pointInRect(x, y, this.x, this.y, this.w, this.h, this.rad);
    }
    destroy(): void { console.error("Entity.destroy() not implemented.") }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; };
    render(board: Board): void { console.error("Entity.render() not implemented.") };
}