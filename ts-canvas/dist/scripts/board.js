import { Entity } from "./entity.js";
import { Layer } from "./layer.js";
import { selectTool } from "./selectTool.js";
export class Board {
    constructor(canvas) {
        this.resizeObserver = new ResizeObserver(() => { this.resize(); });
        this.isPlaying = false;
        this.layers = [];
        this.activeLayer = null;
        this.activeTool = null;
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
    tool(name) {
        // disable the current tool
        if (this.activeTool)
            this.activeTool.disable();
        // if no name is specified or the board is paused, remove the tool
        if (!name || !this.isPlaying) {
            this.activeTool = null;
            return;
        }
        // return if the tool is already active
        if (this.activeTool && this.activeTool.name === name) {
            console.warn(`\"${name}\" tool is already active.`);
            return;
        }
        // enable the new tool
        switch (name) {
            case "select":
                this.activeTool = selectTool;
                break;
            default:
                console.warn(`Tool \"${name}\" does not exist.`);
                break;
        }
        // if a new tool was chosen, enable it
        if (this.activeTool)
            this.activeTool.enable(this, this.activeLayer);
    }
    add(...objects) {
        for (let object of objects) {
            // add layer(s)
            if (object instanceof Layer) {
                // check for duplicate layers
                if (this.layers.findIndex(layer => layer.ID === object.ID) > -1) {
                    console.warn(`Layer with ID ${object.ID} already exists.`);
                    continue;
                }
                this.layers.push(object);
                if (this.layers.length === 1)
                    this.activeLayer = object;
            }
            // add entity(s) to active layer
            else if (object instanceof Entity) {
                // layer takes care of duplicate entities
                if (this.activeLayer)
                    this.activeLayer.add(object);
                else
                    console.warn("No active layer to add entity to!");
            }
        }
    }
    destroy(...objects) {
        // if no objects are specified, destroy all
        if (objects.length === 0) {
            for (let layer of this.layers)
                layer.destroy();
            this.layers = [];
            this.activeLayer = null;
            return;
        }
        // otherwise, destroy the specified layers and entities
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
    play() {
        if (this.isPlaying)
            return;
        this.isPlaying = true;
        let me = this;
        function loop() {
            if (!me.isPlaying)
                return;
            // do something
            me.render();
            updateFPS();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }
    pause() {
        // stop the animation loop
        this.isPlaying = false;
        // disable the active tool
        this.tool();
    }
}
// ******* FPS COUNTER *********
let start = performance.now(), previous = start, ticks = 0, FPS = 0;
const updateFPS = () => {
    let now = performance.now(), delta = now - previous;
    if (delta >= 1000) {
        previous = now;
        FPS = ticks;
        ticks = 0;
    }
    ticks++;
    if (delta >= 200)
        document.getElementById("fps").innerHTML = FPS.toString();
};
// *****************************
