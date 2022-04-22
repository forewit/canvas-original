import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { generate_ID, Rect, pointInRect } from "../modules/utils.js";

export class Entity {
    readonly ID: string = generate_ID();

    opacity: number = 1;
    outline: boolean = false;
    rad: number; // angle in radians
    rect: Rect;

    constructor(x: number, y: number, w: number, h: number, rad?: number) {
        this.rect = new Rect(x, y, w, h);
        this.rad = rad || 0;
    }

    isIntersectingPoint(x: number, y: number): boolean {
        return pointInRect(x, y, this.rect, this.rad);
    }
    destroy(): void { console.error("Entity.destroy() not implemented.") }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; };
    render(board: Board): void { 
        // draw outline
        if (this.outline) {
            let ctx = board.ctx;
            ctx.save();
            ctx.translate(this.rect.x, this.rect.y);
            ctx.rotate(this.rad);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.rect.w / 2, -this.rect.h / 2, this.rect.w, this.rect.h);
            ctx.restore();
        }
    };
}