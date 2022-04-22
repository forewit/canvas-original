import { generate_ID, Rect, pointInRect } from "../modules/utils.js";
export class Entity {
    constructor(x, y, w, h, rad) {
        this.ID = generate_ID();
        this.opacity = 1;
        this.outline = false;
        this.rect = new Rect(x, y, w, h);
        this.rad = rad || 0;
    }
    isIntersectingPoint(x, y) {
        return pointInRect(x, y, this.rect, this.rad);
    }
    destroy() { console.error("Entity.destroy() not implemented."); }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    ;
    render(board) {
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
    }
    ;
}
