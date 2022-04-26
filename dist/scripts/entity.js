import { generate_ID, Rect, pointInRect } from "../modules/utils.js";
export class Entity {
    constructor(x, y, w, h, rad) {
        this.ID = generate_ID();
        this.enabled = true;
        this.outline = false;
        this.opacity = 1;
        this.rect = new Rect(x, y, w, h, rad);
    }
    isIntersectingPoint(x, y) {
        return pointInRect(x, y, this.rect);
    }
    destroy() { console.error("Entity.destroy() not implemented."); }
    duplicate() { console.error("Entity.duplicate() not implemented."); return null; }
    ;
    render(board) {
        if (!this.enabled)
            return;
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
    }
    ;
}
