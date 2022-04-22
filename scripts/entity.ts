import { Board } from "./board.js";
import { Layer } from "./layer.js";
import { generate_ID, Rect, pointInRect } from "../modules/utils.js";

export class Entity {
    readonly ID: string = generate_ID();

    enabled: boolean = true;
    outline: boolean = false;
    opacity: number = 1;
    rect: Rect;

    constructor(x: number, y: number, w: number, h: number, rad?: number) {
        this.rect = new Rect(x, y, w, h, rad);
    }

    isIntersectingPoint(x: number, y: number): boolean {
        return pointInRect(x, y, this.rect);
    }
    destroy(): void { console.error("Entity.destroy() not implemented.") }
    duplicate(): Entity { console.error("Entity.duplicate() not implemented."); return null; };
    render(board: Board): void { 
        if (!this.enabled) return;

        // draw outline
        if (this.outline) {
            let ctx = board.ctx;
            ctx.save();
            ctx.translate(this.rect.x, this.rect.y);
            ctx.rotate(this.rect.rad);
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 1;
            ctx.strokeRect(-this.rect.halfw, -this.rect.halfh, this.rect.w, this.rect.h);
            ctx.restore();
        }
    };
}