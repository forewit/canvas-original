export class Board {
    constructor(canvas) {
        this.top = 0;
        this.left = 0;
        this.width = 0;
        this.height = 0;
        this.origin = { x: 0, y: 0 };
        this.scale = window.devicePixelRatio;
        this.isUpdated = true;
        this.layers = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        // add resize listener
        window.addEventListener("resize", () => { this.resize(); });
        this.resize();
    }
    resize() {
        console.log("resizing board...");
        // get element size
        let rect = this.canvas.getBoundingClientRect();
        this.top = rect.top;
        this.left = rect.left;
        this.width = rect.width;
        this.height = rect.height;
        // reset canvas transforms
        this.ctx.resetTransform();
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    // TODO: addLayer(layer: Layer)
    // TODO: destroyLayer(layer: Layer)
    translate(dx, dy) {
        this.origin.x -= dx;
        this.origin.y -= dy;
        this.isUpdated = true;
    }
    zoomOnPoint(x, y, zoomFactor) {
        // calculate the distance from the viewable origin
        let offsetX = x - this.origin.x, offsetY = y - this.origin.y;
        // move the origin by scaling the offset
        this.origin.x += offsetX - offsetX / zoomFactor;
        this.origin.y += offsetY - offsetY / zoomFactor;
        // apply the new scale to the canvas
        this.scale *= zoomFactor;
        this.isUpdated = true;
    }
    render() {
        // save and apply canvas transforms
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.origin.x, -this.origin.y);
        // clear canvas
        this.ctx.clearRect(this.origin.x, this.origin.y, this.width / this.scale, this.height / this.scale);
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
