import { Point, Rect } from "./types.js";
import { Layer } from "./layer.js";

export class Board {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    rect: Rect;
    origin: Point = { x: 0, y: 0 };
    scale = window.devicePixelRatio;
    isUpdated = true;
    layers: Layer[] = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        // add resize listener
        window.addEventListener("resize", () => { this.resize() });
        this.resize();
    }

    private resize(): void {
        console.log("resizing board...");

        // get canvas element size
        let bounds = this.canvas.getBoundingClientRect();
        this.rect = {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width * window.devicePixelRatio,
            height: bounds.height * window.devicePixelRatio
        };

        // reset canvas transforms
        this.ctx.resetTransform();
        this.canvas.width = this.rect.width;
        this.canvas.height = this.rect.height;
    }

    // TODO: addLayer(layer: Layer)
    // TODO: destroyLayer(layer: Layer)

    translate(dx: number, dy: number): void {
        this.origin.x -= dx;
        this.origin.y -= dy;

        this.isUpdated = true;
    }

    zoomOnPoint(point: Point, zoomFactor: number): void {
        // calculate the distance from the viewable origin
        let offsetX = point.x - this.origin.x,
            offsetY = point.y - this.origin.y;

        // move the origin by scaling the offset
        this.origin.x += offsetX - offsetX / zoomFactor;
        this.origin.y += offsetY - offsetY / zoomFactor;

        // apply the new scale to the canvas
        this.scale *= zoomFactor;

        this.isUpdated = true;
    }

    render(): void {
        // save and apply canvas transforms
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.origin.x, -this.origin.y);

        // clear canvas
        this.ctx.clearRect(
            this.origin.x, this.origin.y,
            this.rect.width / this.scale, this.rect.height / this.scale
        );

        // ------TEMPORARY----------
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28); // draw corner
        this.ctx.rect(this.origin.x, this.origin.y, 10, 10); // draw origin
        this.ctx.stroke();
        // -------------------------

        // render layers
        // TODO: render layers in order

        // restore canvas transforms
        this.ctx.restore();

        // reset updated flag
        this.isUpdated = false;
    }
}