// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
export class Note extends Entity {
    constructor(elm, x, y, w, h, angle) {
        // The Note will be added to the canvas but transforms 
        // will be applied to it's DOM element.
        super(x, y, w, h, angle);
        this.isLoaded = false;
        this.elm = elm;
        this.elm.style.transformOrigin = "center";
        // Set width and height again now that the element is set
        this.w = w;
        this.h = h;
    }
    get w() { return this._w; }
    get h() { return this._h; }
    set w(w) {
        this._w = w;
        if (this.elm)
            this.elm.style.width = `${w}px`;
    }
    set h(h) {
        this._h = h;
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
            ctx.canvas.parentNode.appendChild(this.elm);
        }
        // Apply transforms
        let scale = board.scale / window.devicePixelRatio, x = board.left + ((this.x - board.origin.x) * scale), y = board.top + ((this.y - board.origin.y) * scale);
        this.elm.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${this.angle}rad) scale(${scale})`;
    }
}
