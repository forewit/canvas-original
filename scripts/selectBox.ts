// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
import { Board } from "./board.js";

export class SelectBox extends Entity {
    constructor() {
        super(0, 0, 0, 0);
        this.enabled = false;
    }
    
    reset(x: number, y: number) {
        this.rect.x = x;
        this.rect.y = y;
        this.rect.w = 0;
        this.rect.h = 0;
    }

    updateBounds(x: number, y: number, dx: number, dy: number) {
        if (dx > 0) {
            // moving right while inside the selection box
            if (x < this.rect.right) this.rect.left += dx;
    
            // moving right while outside the selection box
            else this.rect.right += dx;
        } else {
            // moving left while inside the selection box
            if (x > this.rect.left) this.rect.right = dx + this.rect.right;
    
            // moving left while outside the selection box
            else this.rect.left = dx + this.rect.left;
        }
    
        if (dy > 0) {
            // moving down while inside the selection box
            if (y < this.rect.bottom) this.rect.top = dy + this.rect.top;
    
            // moving down while outside the selection box
            else this.rect.bottom = dy + this.rect.bottom;
        } else {
            // moving up while inside the selection box
            if (y > this.rect.top) this.rect.bottom = dy + this.rect.bottom;
    
            // moving up while outside the selection box
            else this.rect.top = dy + this.rect.top;
        }
    
        // update width and height
        this.rect.w = this.rect.right - this.rect.left;
        this.rect.h = this.rect.bottom - this.rect.top;
    }

    render(board: Board) {
        super.render(board);
        if (!this.enabled) return;
        let ctx = board.ctx;

        // draw selection box
        ctx.save();
        ctx.strokeStyle = "rgba(100, 0, 100, 0.2)";
        ctx.lineWidth = 3;
        ctx.strokeRect(this.rect.left, this.rect.top, this.rect.w, this.rect.h);
        ctx.restore();
    }
}