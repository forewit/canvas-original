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
        
        let firstLayer = new Layer();
        this.activeLayer = firstLayer;
        this.addLayer(firstLayer);

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
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) return
        }
        this.layers.push(layer);
    }
    destroyLayer() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) {
                this.layers[i].destroy();
                this.layers.splice(i, 1);
                return true;
            }isadmin
        }
        return false;
    }
    resize() {
        // recalculate canvas size
        this.rect = this.elm.getBoundingClientRect();

        this.ctx.resetTransform()
        this.ctx.canvas.width = this.rect.width;
        this.ctx.canvas.height = this.rect.height;

        this.ctx.scale(this.scale,this.scale);
        this.ctx.translate(-this.originx, -this.originy);
    }
    render() {
        // Use the identity matrix while clearing the canvas
        this.ctx.clearRect(
            this.originx, this.originy, 
            this.rect.width/this.scale, this.rect.height/this.scale);

        // draw origin point
        this.ctx.beginPath();
        this.ctx.ellipse(0,0,10,10,0,0,6.28);
        this.ctx.rect(this.originx, this.originy, 10, 10);
        this.ctx.stroke();

        // re-render active layer
        this.activeLayer.render();

        // draw each layer canvas to the context
        this.layers.forEach(layer => {
            this.ctx.drawImage(layer.canvas, 
                this.originx, this.originy, 
                this.rect.width/this.scale, this.rect.height/this.scale);
        });
    }
}