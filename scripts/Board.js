import { Layer } from "./layer.js";

export class Board {
    constructor(elm) {
        this.elm = elm;
        this.left = 0;
        this.top = 0;
        this.width = 0;
        this.height = 0;
        this.ctx = elm.getContext("2d");
        this.dpi = window.devicePixelRatio;
        this.layers = [];
        this.originx = 0;
        this.originy = 0;
        this.scale = this.dpi;
        this.UILayer = new Layer();
        this._activeLayer = undefined;

        // initial resizing
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

    translateView(dx, dy) {
        this.originx -= dx;
        this.originy -= dy;
    }

    zoomOnPoint(x, y, zoom) {
        // calculate the distance from the viewable origin
        let offsetX = x - this.originx,
            offsetY = y - this.originy;

        // move the origin by scaling the offset
        this.originx += offsetX - offsetX/zoom;
        this.originy += offsetY - offsetY/zoom;

        // apply the new scale to the canvas
        this.scale *= zoom;
    }

    importJSON() {}
    exportJSON() {}

    resize() {
        // recalculate canvas size
        let rect = this.elm.getBoundingClientRect();
        this.dpi = window.devicePixelRatio;
        this.left = rect.left;
        this.top = rect.top;
        this.width = rect.width * this.dpi;
        this.height = rect.height * this.dpi;

        // reset canvas transforms
        this.ctx.resetTransform()
        this.elm.width = this.width;
        this.elm.height = this.height;

        console.log("RESIZE!");
    }

    render() {
        // save and apply canvas transforms
        this.ctx.save()
        this.ctx.scale(this.scale, this.scale); // scale first
        this.ctx.translate(-this.originx, -this.originy) // then translate

        // Use the identity matrix while clearing the canvas
        this.ctx.clearRect(
            this.originx, this.originy,
            this.width / this.scale, this.height / this.scale);

        // draw origin point
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 10, 0, 0, 6.28);
        this.ctx.rect(this.originx, this.originy, 10, 10);
        this.ctx.stroke();

        // render content layers
        this.layers.forEach(layer => layer.render(this.ctx));

        // render UI layer
        this.UILayer.render(this.ctx);

        // restore saved canvas transforms
        this.ctx.restore();
    }
}