// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
export class Handle extends Entity {
    render(board) {
        super.render(board);
        if (!this.enabled)
            return;
        // draw selection box
        let ctx = board.ctx;
        ctx.save();
        ctx.translate(this.rect.x, this.rect.y);
        ctx.rotate(this.rect.rad);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.rect.halfw, -this.rect.halfh, this.rect.w, this.rect.h);
        ctx.restore();
    }
}
