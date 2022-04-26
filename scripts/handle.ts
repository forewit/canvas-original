// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { Rect } from "../modules/utils.js";

export class Handle extends Entity {
    resizeDiv = document.createElement('div');
    rotateDiv = document.createElement('div');
    isLoaded = false;

    constructor() {
        super(0, 0, 0, 0);
        this.enabled = false;

        // css
        this.resizeDiv.className = "handle-resize";
        this.rotateDiv.className = "handle-rotate";
    }

    updateBounds(entities: Entity[]) {
        if (entities.length === 0) {
            this.rect = new Rect(0, 0, 0, 0);
            return null;
        }

        this.rect.x = entities[0].rect.x;
        this.rect.y = entities[0].rect.y;
        this.rect.w = entities[0].rect.w;
        this.rect.h = entities[0].rect.h;
        this.rect.rad = entities[0].rect.rad;

        // allow a rotated bounding box if there is only one entity
        if (entities.length === 1) return;

        // expand bounding box to include all entities
        this.rect.rad = 0;

        let boundingLeft = this.rect.left,
            boundingRight = this.rect.right,
            boundingTop = this.rect.top,
            boundingBottom = this.rect.bottom;

        for (let entity of entities) {
            let angle = entity.rect.rad % (Math.PI);
            if (angle > Math.PI / 2) angle = Math.PI - angle;

            let halfW = (Math.sin(angle) * entity.rect.h + Math.cos(angle) * entity.rect.w) / 2,
                halfH = (Math.sin(angle) * entity.rect.w + Math.cos(angle) * entity.rect.h) / 2;

            let left = entity.rect.x - halfW,
                right = entity.rect.x + halfW,
                top = entity.rect.y - halfH,
                bottom = entity.rect.y + halfH;

            boundingLeft = Math.min(boundingLeft, left);
            boundingRight = Math.max(boundingRight, right);
            boundingTop = Math.min(boundingTop, top);
            boundingBottom = Math.max(boundingBottom, bottom);
        }

        this.rect.w = boundingRight - boundingLeft;
        this.rect.h = boundingBottom - boundingTop;
        this.rect.x = boundingLeft + this.rect.halfw;
        this.rect.y = boundingTop + this.rect.halfh;
    }

    render(board: Board) {
        super.render(board);

        // check if the handle is enabled
        if (!this.enabled) {
            this.resizeDiv.classList.add('hidden');
            this.rotateDiv.classList.add('hidden');
            return;
        } else if (this.resizeDiv.classList.contains('hidden')) {
            this.resizeDiv.classList.remove('hidden');
            this.rotateDiv.classList.remove('hidden');
        }

        // add rotate and resize divs to the DOM
        let ctx = board.ctx;
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.resizeDiv, ctx.canvas);
            ctx.canvas.parentNode.insertBefore(this.rotateDiv, ctx.canvas);
        }

        // draw selection box
        ctx.save();
        ctx.translate(this.rect.x, this.rect.y);
        ctx.rotate(this.rect.rad);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.rect.halfw, -this.rect.halfh, this.rect.w, this.rect.h);
        ctx.restore();


        // enable resize and rotate divs
        // TODO
    }
}