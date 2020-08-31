import { Layer } from "./layer.js";
import * as utils from "./utils.js";

export class Canvas {
    constructor(elm) {
        this.elm = elm;
        this.rect = this.elm.getBoundingClientRect();
        this.ctx = elm.getContext("2d");
        this.layers = [];
        this.originx = 0;
        this.originy = 0;
        this.scale = 1;

        if (!(this.ctx instanceof CanvasRenderingContext2D)) alert("Canvas API unavailable");
        this.resize();
    }
    bringForward(layer) {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) {
                this.layers.splice(i, 1);
                this.layers.push(layer);
                return true;
            }
        }
        return false;
    }
    sendBackward(layer) {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) {
                this.layers.splice(i, 1);
                this.layers.unshift(layer);
                return true;
            }
        }
        return false;
    }
    addLayer(layer) {
        this.layers.push(layer);
    }
    destroyLayer() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) {
                this.layers[i].destroy;
                this.layers.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    resize() {
        // recalculate canvas size
        this.rect = this.elm.getBoundingClientRect();
        this.ctx.canvas.width = this.rect.width;
        this.ctx.canvas.height = this.rect.height;
    }
    render() {
        // Use the identity matrix while clearing the canvas
        this.ctx.clearRect(
            -this.originx + 10, -this.originy + 10, 
            this.rect.width - 20, this.rect.height - 20);

        // draw origin point
        this.ctx.beginPath();
        this.ctx.ellipse(0,0,10,10,0,0,6.28);
        this.ctx.stroke();

        // TODO:
        // - draw active layer
        // - render all layers
        for (var i = 0, len = this.layers.length; i < len; i++) {
            this.layers[i].render(this.ctx); 
        }
    }
}