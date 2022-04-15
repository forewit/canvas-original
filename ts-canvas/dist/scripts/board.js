import { Entity } from "./entity.js";
import { Layer } from "./layer.js";
export class Board {
    constructor(canvas) {
        this.resizeObserver = new ResizeObserver(() => { this.resize(); });
        this.isPlaying = false;
        this.layers = [];
        this.activeLayer = null;
        this.top = 0;
        this.left = 0;
        this.origin = { x: 0, y: 0 };
        this.scale = window.devicePixelRatio;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        // add resize listener
        this.resizeObserver.observe(this.canvas);
    }
    resize() {
        // update the board size
        let rect = this.canvas.getBoundingClientRect();
        this.top = rect.top;
        this.left = rect.left;
        // set canvas properties and transform
        this.ctx.resetTransform();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        // logging
        console.log("Resized board...");
    }
    render() {
        // save and apply canvas transforms
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.origin.x, -this.origin.y);
        // clear canvas
        // -----TEMPORARY: remove buffer in production
        let buffer = 10 / this.scale;
        this.ctx.clearRect(this.origin.x + buffer, this.origin.y + buffer, (this.canvas.width / this.scale) - 2 * buffer, (this.canvas.height / this.scale) - 2 * buffer);
        // ------TEMPORARY----------
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28); // draw corner
        this.ctx.rect(this.origin.x, this.origin.y, 10, 10); // draw origin
        this.ctx.stroke();
        // -------------------------
        // render layers
        for (let layer of this.layers)
            layer.render(this);
        // restore canvas transforms
        this.ctx.restore();
    }
    add(...objects) {
        for (let object of objects) {
            // add layer(s)
            if (object instanceof Layer) {
                this.layers.push(object);
            }
            // add entity(s) to active layer
            else if (object instanceof Entity) {
                if (this.activeLayer)
                    this.activeLayer.add(object);
            }
        }
    }
    destroy(...objects) {
        for (let object of objects) {
            // remove layer(s)
            if (object instanceof Layer) {
                let index = this.layers.indexOf(object);
                if (index > -1)
                    this.layers.splice(index, 1);
            }
            // remove entity(s) from active layer
            else if (object instanceof Entity) {
                if (this.activeLayer)
                    this.activeLayer.destroy(object);
            }
        }
    }
    pan(dx, dy) {
        this.origin.x -= dx;
        this.origin.y -= dy;
    }
    zoom(x, y, zoomFactor) {
        // calculate the distance from the viewable origin
        let offsetX = x - this.origin.x, offsetY = y - this.origin.y;
        // move the origin by scaling the offset
        this.origin.x += offsetX - offsetX / zoomFactor;
        this.origin.y += offsetY - offsetY / zoomFactor;
        // apply the new scale to the canvas
        this.scale *= zoomFactor;
    }
    play(callback) {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        let me = this;
        function loop() {
            if (!me.isPlaying)
                return;
            callback();
            // render the board
            me.render();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }
    pause() {
        // stop the animation loop
        this.isPlaying = false;
        // TODO: maybe should remove active tool?
    }
}
