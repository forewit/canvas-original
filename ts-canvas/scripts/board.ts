import { Layer } from "./layer.js";

export class Board {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    top: number = 0;
    left: number = 0;
    width: number = 0;
    height: number = 0;
    origin = { x: 0, y: 0 };
    scale = window.devicePixelRatio;
    isUpdated = true;
    isPlaying = false;
    layers: Layer[] = [];
    resizeObserver = new ResizeObserver(() => { this.resize(); });

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // add resize listener
        this.resizeObserver.observe(this.canvas);
        //this.resize();
    }

    private resize(): void {
        // update the board size
        let rect = this.canvas.getBoundingClientRect();
        this.top = rect.top;
        this.left = rect.left;
        this.width = rect.width;
        this.height = rect.height;

        // set canvas properties and transform
        this.ctx.resetTransform();
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // logging
        console.log("Resized board...");
    }

    private render(): void {
        // save and apply canvas transforms
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.origin.x, -this.origin.y);

        // clear canvas
        this.ctx.clearRect(
            this.origin.x, this.origin.y,
            this.width / this.scale, this.height / this.scale
        );

        // ------TEMPORARY----------
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28); // draw corner
        this.ctx.rect(this.origin.x, this.origin.y, 10, 10); // draw origin
        this.ctx.stroke();
        // -------------------------

        // render layers
        for (let layer of this.layers) {
            layer.render(this);
        }

        // restore canvas transforms
        this.ctx.restore();

        // reset updated flag
        this.isUpdated = false;
    }

    translate(dx: number, dy: number): void {
        this.origin.x -= dx;
        this.origin.y -= dy;

        this.isUpdated = true;
    }

    zoomOnPoint(x: number, y: number, zoomFactor: number): void {
        // calculate the distance from the viewable origin
        let offsetX = x - this.origin.x,
            offsetY = y - this.origin.y;

        // move the origin by scaling the offset
        this.origin.x += offsetX - offsetX / zoomFactor;
        this.origin.y += offsetY - offsetY / zoomFactor;

        // apply the new scale to the canvas
        this.scale *= zoomFactor;

        this.isUpdated = true;
    }

    play(callback: Function): void {
        if (this.isPlaying) return;

        this.isPlaying = true;
        let me = this;

        function loop(): void {
            if (!me.isPlaying) return;
            callback();

            // render the board
            me.render();
            requestAnimationFrame(loop);
        }

        requestAnimationFrame(loop);
    }

    pause(): void {
        // stop the animation loop
        this.isPlaying = false;
    }

    destroy(): void {
        // destroy all layers
        for (let layer of this.layers) {
            layer.destroy();
        }

    }
}