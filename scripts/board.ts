import { Entity } from "./entity.js";
import { Layer } from "./layer.js";
import { selectTool } from "./selectTool.js";

export interface Tool {
    name: string;
    enable(board: Board, layer: Layer): void;
    disable(): void;
}

// ******* FPS COUNTER *********
let start = performance.now(),
    previous = start,
    ticks = 0,
    FPS = 0;

const updateFPS = () => {
    let now = performance.now(),
        delta = now - previous;

    if (delta >= 1000) {
        previous = now;
        FPS = ticks;
        ticks = 0;
    }
    ticks++;

    if (delta >= 200) document.getElementById("fps").innerHTML = FPS.toString();
}
// *****************************

export class Board {
    private resizeObserver = new ResizeObserver(() => { this.resize(); });
    private isPlaying = false;
    private layers: Layer[] = [];
    private activeLayer: Layer = null;
    private activeTool: Tool = null;

    uiLayer = new Layer();
    div: HTMLDivElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    top: number = 0;
    left: number = 0;
    origin = { x: 0, y: 0 };
    scale = window.devicePixelRatio;

    constructor(div: HTMLDivElement) {
        this.div = div;
        this.canvas = document.createElement("canvas");
        this.div.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");

        // add resize listener
        this.resizeObserver.observe(this.canvas);
    }

    private resize(): void {
        // update the board size
        let rect = this.div.getBoundingClientRect();
        this.top = rect.top;
        this.left = rect.left;

        // set canvas properties and transform
        this.ctx.resetTransform();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;

        // logging
        console.log("Resized board...");
    }

    private render(): void {
        // save and apply canvas transforms
        this.ctx.save();
        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.origin.x, -this.origin.y);

        // clear canvas
        let buffer = 10 / this.scale;
        this.ctx.clearRect(
            this.origin.x + buffer, this.origin.y + buffer,
            (this.canvas.width / this.scale) - buffer*2, (this.canvas.height / this.scale) - buffer*2
        );

        // ------TEMPORARY----------
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28); // draw corner
        this.ctx.rect(this.origin.x, this.origin.y, 10, 10); // draw origin
        this.ctx.stroke();
        // -------------------------

        // render layers
        for (let layer of this.layers) layer.render(this);
        this.uiLayer.render(this);

        // restore canvas transforms
        this.ctx.restore();
    }

    tool(name?: string): void {
        // disable the current tool
        if (this.activeTool) this.activeTool.disable();

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
        if (this.activeTool) this.activeTool.enable(this, this.activeLayer);
    }

    add(...objects: (Layer | Entity)[]): void {
        for (let object of objects) {
            // add layer(s)
            if (object instanceof Layer) {
                // check for duplicate layers
                if (this.layers.findIndex(layer => layer.ID === object.ID) > -1) {
                    console.warn(`Layer with ID ${object.ID} already exists.`);
                    continue;
                }
                this.layers.push(object);
                if (this.layers.length === 1) this.activeLayer = object;
            }

            // add entity(s) to active layer
            else if (object instanceof Entity) {
                // layer takes care of duplicate entities
                if (this.activeLayer) this.activeLayer.add(object);
                else console.warn("No active layer to add entity to!");
            }
        }
    }

    destroy(...objects: (Layer | Entity)[]): void {
        // if no objects are specified, destroy all
        if (objects.length === 0) {
            for (let layer of this.layers) layer.destroy();
            this.layers = [];
            this.activeLayer = null;
            return;
        }

        // otherwise, destroy the specified layers and entities
        for (let object of objects) {
            // remove layer(s)
            if (object instanceof Layer) {
                let index = this.layers.indexOf(object);
                if (index > -1) this.layers.splice(index, 1);
            }

            // remove entity(s) from active layer
            else if (object instanceof Entity) {
                if (this.activeLayer) this.activeLayer.destroy(object);
            }
        }
    }

    pan(dx: number, dy: number): void {
        this.origin.x -= dx;
        this.origin.y -= dy;
    }

    zoom(x: number, y: number, zoomFactor: number): void {
        // calculate the distance from the viewable origin
        let offsetX = x - this.origin.x,
            offsetY = y - this.origin.y;

        // move the origin by scaling the offset
        this.origin.x += offsetX - offsetX / zoomFactor;
        this.origin.y += offsetY - offsetY / zoomFactor;

        // apply the new scale to the canvas
        this.scale *= zoomFactor;
    }

    play(fn: Function): void {
        if (this.isPlaying) return;
        this.isPlaying = true;
        let me = this;

        function loop(): void {
            if (!me.isPlaying) return;

            // do something
            fn();
            me.render();
            updateFPS();

            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    pause(): void {
        // stop the animation loop
        this.isPlaying = false;

        // disable the active tool
        this.tool();
    }
}