import { Layer } from "./layer.js";

export class Canvas {
    constructor(elm) {
        this.elm = elm;
        this.layers = [];
    }
    bringForward(layer) {

    }
    sendBackward(layer) {

    }
    createLayer() {

    }
    destroyLayer() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            if (this.layers[i].ID == layer.ID) {
                this.layers[i].destroy;
                this.layers.splice(i, 1);
                return;
            }
        }
    }
    resize() {
        for (var i = 0, len = this.layers.length; i < len; i++) {
            layers[i].elm.width = this.elm.clientWidth;
            layers[i].elm.height = this.elm.clientHeight;
        }
    }
}