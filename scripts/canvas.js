import { Layer } from "./layer.js";
import * as utils from "./utils.js";

export class Canvas {
    constructor(elm) {
        this.elm = elm;
        this.rect = this.elm.getBoundingClientRect();
        this._ctx = elm.getContext("2d");
        this._layers = [];

        if (!(this._ctx instanceof CanvasRenderingContext2D)) alert("Canvas API unavailable");
        this.resize();
    }
    bringForward(layer) {
        for (var i = 0, len = this._layers.length; i < len; i++) {
            if (this._layers[i].ID == layer.ID) {
                this._layers.splice(i, 1);
                this._layers.push(layer);
                return true;
            }
        }
        return false;
    }
    sendBackward(layer) {
        for (var i = 0, len = this._layers.length; i < len; i++) {
            if (this._layers[i].ID == layer.ID) {
                this._layers.splice(i, 1);
                this._layers.unshift(layer);
                return true;
            }
        }
        return false;
    }
    addLayer(layer) {
        this._layers.push(layer);
    }
    destroyLayer() {
        for (var i = 0, len = this._layers.length; i < len; i++) {
            if (this._layers[i].ID == layer.ID) {
                this._layers[i].destroy;
                this._layers.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    resize() {
        // recalculate canvas size
        this.rect = this.elm.getBoundingClientRect();
        this._ctx.canvas.width = this.rect.width;
        this._ctx.canvas.height = this.rect.height;
    }
    render() {
        // clear canvas
        this._ctx.clearRect(0, 0, this.rect.width, this.rect.height);
        
        // render each layer
        for (var i = 0, len = this._layers.length; i < len; i++) {
            this._layers[i].render(this._ctx);
        }
    }
}