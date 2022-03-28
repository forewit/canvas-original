// Note's allow you to add a DOM element as an Entity.
import { Entity } from "./entity.js";

export class Drawing extends Entity {
    constructor() {
        // The Note entity will be added to the canvas and the transforms 
        // will be applied to the Note's DOM element.
        // Rotations are not supported!

        super(); // Entity class constructor

        // Properties
        this.isLoaded = false;
        this.elm = document.createElement("canvas");
        this.ctx = this.elm.getContext("2d");
        this.elm.style.position = "absolute";
        this.elm.style.background = "lightblue";

        // Enable resizing

        this.resize = this.resizeHandler.bind(this);
        window.addEventListener("resize", this.resize);
        this.resizeObserver = new ResizeObserver(this.resize);
        this.resizeObserver.observe(this.elm);
        // TODO add window resize listener and option to redraw on scale change
    }

        // override setters and getters for width and height to allow resizing
        get w() { return this._w; }
        get h() { return this._h; }
        set w(neww) {
            this._w = neww;
            this._halfw = neww / 2;
            this.updated = true;
            this.elm.style.width = neww + "px";
        }
        set h(newh) {
            this._h = newh;
            this._halfh = newh / 2;
            this.updated = true;
            this.elm.style.height = newh + "px";
        }

    resizeHandler() {
        // Update Entity properties to match the DOM element
        let rect = this.elm.getBoundingClientRect();

        this.x += (rect.width - this.w)/2;
        this.y += (rect.height - this.h)/2;
        this.w = rect.width;
        this.h = rect.height;

        // Update the canvas size
        this.elm.width = this.w * window.devicePixelRatio;
        this.elm.height = this.h * window.devicePixelRatio;

        // draw origin point
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28);
        this.ctx.stroke();

        console.log("resized");
    }

    _destroy() {
        this.resizeObserver.disconnect();
        window.removeEventListener("resize", this.resize);
        this.elm.remove();
    }

    _render(ctx, updated) {
        // render directly to the canvas instead of the DOM.
        // use the same positioning and scaling logic as the sprite class.


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