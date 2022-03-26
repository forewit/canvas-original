// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";

export class Note extends Entity {
    constructor(elm) {
        // The Note entity will be added to the canvas and the transforms 
        // will be applied to the Note's DOM element.
        // Rotations are not supported!

        super(); // Entity class constructor

        // Properties
        this.isLoaded = false;
        this.elm = elm;

        // Enable resizing
        this.resizeObserver = new ResizeObserver(this._resize.bind(this));
        this.resizeObserver.observe(this.elm);
    }

    _resize() {
        // Update Entity properties to match the DOM element
        let rect = this.elm.getBoundingClientRect();

        this.x += (rect.width - this.w)/2;
        this.y += (rect.height - this.h)/2;
        this.w = rect.width;
        this.h = rect.height;
    }

    _destroy() {
        this.resizeObserver.disconnect();
        this.elm.remove();
    }

    _render(ctx, updated) {
        // Only render if the board has been updated (moved or scaled)
        if (!updated) return;

        // Add elemnent to DOM
        if (!this.isLoaded) {
            this.isLoaded = true;
            ctx.canvas.parentNode.insertBefore(this.elm, ctx.canvas);
        }

        // Get the canvas transforms
        let transforms = ctx.getTransform();
        let dpi = window.devicePixelRatio;
        let scale = transforms.a / dpi;
        let x_offset = (transforms.e / dpi) / scale - this.halfw;
        let y_offset = (transforms.f / dpi) / scale - this.halfh;

        // Update position and scale
        this.elm.style.left = this.x + x_offset + "px";
        this.elm.style.top = this.y + y_offset + "px";
        this.elm.style.zoom = scale;
    }
}