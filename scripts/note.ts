// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";
import { Board } from "./board.js";

export class Note extends Entity {
    elm: HTMLElement;
    isLoaded = false;

    get w(): number { return this._w; }
    get h(): number { return this._h; }
    set w(w: number) {
        this._w = w;
        if (this.elm) this.elm.style.width = `${w}px`;
    }
    set h(h: number) {
        this._h = h;
        if (this.elm) this.elm.style.height = `${h}px`;
    }

    constructor(elm: HTMLElement, x: number, y: number, w: number, h: number, angle?: number) {
        // The Note will be added to the canvas but transforms 
        // will be applied to it's DOM element.
        super(x, y, w, h, angle);
        this.elm = elm;
        this.elm.style.transformOrigin = "center";

        // Set width and height again now that the element is set
        this.w = w;
        this.h = h;
    }

    destroy() {
        this.elm.remove();
    }

    render(board: Board) {
        let ctx = board.ctx;

        // Add elemnent to DOM
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.elm, ctx.canvas);
        }

        // Apply transforms
        let scale = board.scale / window.devicePixelRatio,
            x = board.left + ((this.x - board.origin.x) * scale),
            y = board.top + ((this.y - board.origin.y) * scale);
        
        this.elm.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${this.rad}rad) scale(${scale})`;
    }
}