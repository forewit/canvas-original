// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
export class Note extends Entity {
    constructor(elm, x, y, w, h, angle) {
        super(x, y, w, h, angle);
        this.isLoaded = false;
        // The Note will be added to the canvas but transforms 
        // will be applied to it's DOM element.
        this.elm = elm;
        this.elm.style.transformOrigin = "center";
        // Set width and height again now that the element is set
        this.resize();
    }
    resize() {
        if (this.elm) {
            this.elm.style.width = `${this.rect.w}px`;
            this.elm.style.height = `${this.rect.h}px`;
        }
    }
    destroy() {
        this.elm.remove();
    }
    render(board) {
        super.render(board);
        let ctx = board.ctx;
        // Add elemnent to DOM
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.elm, ctx.canvas);
        }
        // Apply transforms
        let scale = board.scale / window.devicePixelRatio, x = board.left + ((this.rect.x - board.origin.x) * scale), y = board.top + ((this.rect.y - board.origin.y) * scale);
        this.elm.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${this.rad}rad) scale(${scale})`;
    }
}
