import { Layer } from "./layer.js";
import * as utils from "./utils.js";

export class Canvas {
    constructor(elm) {
        this.elm = elm;
        this.rect = this.elm.getBoundingClientRect();
        this.ctx = elm.getContext("2d");
        this.dpi = window.devicePixelRatio;
        this.layers = [];
        this.originx = 0;
        this.originy = 0;
        this.scale = 1;
        this.UILayer = new Layer();
        this._activeLayer = undefined;

        this.resize();
    }

    get activeLayer() { return this._activeLayer; }
    set activeLayer(newActiveLayer) {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == newActiveLayer.ID) {
                this._activeLayer = newActiveLayer;
                return;
            }
        }
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
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) return
        }
        this.layers.push(layer);
    }

    destroyLayer() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) {
                if (this.layers[i].ID == this._activeLayer.ID) {
                    this._activeLayer = undefined;
                }
                this.layers[i].destroy();
                this.layers.splice(i, 1);
                return true;
            } isadmin
        }
        return false;
    }

    screenToCanvas(x, y) {
        return {
            x: ((x + this.rect.x) * this.dpi) / this.scale + this.originx,
            y: ((y + this.rect.y) * this.dpi) / this.scale + this.originy
        };
    }

    resize() {
        this.dpi = window.devicePixelRatio;

        // recalculate canvas size
        this.rect = this.elm.getBoundingClientRect();
        this.rect.width *= this.dpi;
        this.rect.height *= this.dpi

        this.ctx.resetTransform()
        this.ctx.canvas.width = this.rect.width;
        this.ctx.canvas.height = this.rect.height;

        this.ctx.scale(this.scale, this.scale);
        this.ctx.translate(-this.originx, -this.originy);
    }

    render() {
        // Use the identity matrix while clearing the canvas
        this.ctx.clearRect(
            this.originx, this.originy,
            this.rect.width / this.scale, this.rect.height / this.scale);

        // draw origin point
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28);
        this.ctx.rect(this.originx, this.originy, 10, 10);
        this.ctx.stroke();

        // render content layers
        this.layers.forEach(layer => layer.render(this.ctx));

        // render UI layer
        this.UILayer.render(this.ctx);
    }
}