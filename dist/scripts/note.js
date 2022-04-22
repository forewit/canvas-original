// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
export class Note extends Entity {
    constructor(elm, rect) {
        super(rect);
        this.isLoaded = false;
        // The Note will be added to the canvas but transforms 
        // will be applied to it's DOM element.
        this.elm = elm;
        //this.elm.style.transformOrigin = "center";
        // Set width and height again now that the element is set
        this.w = rect.w;
        this.h = rect.h;
    }
    get w() { return this.rect.w; }
    get h() { return this.rect.h; }
    set w(w) {
        this.rect.w = w;
        if (this.elm)
            this.elm.style.width = `${w}px`;
    }
    set h(h) {
        this.rect.h = h;
        if (this.elm)
            this.elm.style.height = `${h}px`;
    }
    destroy() {
        this.elm.remove();
    }
    render(board) {
        let ctx = board.ctx;
        // Add elemnent to DOM
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.elm, ctx.canvas);
        }
        // Apply transforms
        let scale = board.scale / window.devicePixelRatio, x = board.left + ((this.x - board.origin.x) * scale), y = board.top + ((this.y - board.origin.y) * scale);
        this.elm.style.transform = `translate(${x}px, ${y}px) rotate(${this.rad}rad) scale(${scale})`;
    }
}
