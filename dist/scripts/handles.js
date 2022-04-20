import { Entity } from "./entity.js";
export class Handles extends Entity {
    render(board) {
        console.error("Entity.render() not implemented.");
        let ctx = board.ctx, halfw = this.w / 2, halfh = this.h / 2, size = 10 / board.scale;
        // save and adjust canvas transforms
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        // draw handles to canvas
        ctx.beginPath();
        ctx.rect(-halfw, -halfh, this.w, this.h);
        ctx.rect(-size - halfw, -size - halfh, this.w + size * 2, this.h + size * 2);
        ctx.rect(size - halfw, size - halfh, this.w - size * 2, this.h - size * 2);
        ctx.stroke();
        // restore canvas transforms
        ctx.restore();
    }
    ;
}
