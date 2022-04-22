import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { Rect, pointInRect, generate_ID } from "../modules/utils.js";

export class Entity {
    /*
    A rectangle is defined by it's corner, width, and height, and angle in radians.
    Angle should rotate around the CENTER of the rectangle.
              w
    *─────────────────┐
    │ (x, y)          │
    │                 | h
    │                 |
    └─────────────────┘
    */
    readonly ID: string = generate_ID();

    protected rect: Rect;
    opacity: number = 1;

    get x(): number { return this.rect.x; }
    get y(): number { return this.rect.y; }
    get w(): number { return this.rect.w; }
    get h(): number { return this.rect.h; }
    get rad(): number { return this.rect.rad; }

    set x(x: number) { this.rect.x = x; }
    set y(y: number) { this.rect.y = y; }
    set w(w: number) { this.rect.w = w; }
    set h(h: number) { this.rect.h = h; }
    set rad(rad: number) { this.rect.rad = rad % (2 * Math.PI) }

    constructor(rect?: Rect) {
        this.rect = rect || { x: 0, y: 0, w: 0, h: 0, rad: 0};
        if (this.rect.rad === undefined) { this.rect.rad = 0; }
    }

    isIntersectingPoint(x: number, y: number): boolean {
        return pointInRect(x, y, this.rect);
    }
    destroy(): void { console.error("Entity.destroy() not implemented.") }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; };
    render(board: Board): void { console.error("Entity.render() not implemented.") };
}