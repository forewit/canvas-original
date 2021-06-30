import { Layer } from "./layer.js";

export class Board {
    constructor(elm) {
        this.elm = elm;
        //this.rect = this.elm.getBoundingClientRect();
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
        //console.log("left:" + this.left + " dpi:" + this.dpi + " origin:" + this.originx + ", " + this.originy);

        return {
            x: ((x + this.left) * this.dpi) / this.scale + this.originx,
            y: ((y + this.top) * this.dpi) / this.scale + this.originy
        };
    }

    translate(dx, dy) {
        this.originx -= dx;
        this.originy -= dy;
    }

    zoomOnPoint(x, y, zoom) {
        this.ctx.translate(this.originx, this.originy);

        this.ctx.scale(zoom, zoom);
        this.scale *= zoom;

        this.ctx.translate(-this.originx, -this.originy);

        /*
        // Translate so the visible origin is at the context's origin.
        this.ctx.translate(this.originx, this.originy);

        // Compute the new visible origin. Originally the mouse is at a
        // distance mouse/scale from the corner, we want the point under
        // the mouse to remain in the same place after the zoom, but this
        // is at mouse/new_scale away from the corner. Therefore we need to
        // shift the origin (coordinates of the corner) to account for this.
        let dx = x - this.originx;
        let dy = y - this.originy;

        // Scale it (centered around the origin due to the trasnslate above).
        this.ctx.scale(zoom, zoom);

        // Offset the visible origin to it's proper position.
        this.ctx.translate(-this.originx, -this.originy);
        this.translate(x, y);

        // Update scale and others.
        this.scale *= zoom;
        */
    }

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
        //this.ctx.scale(this.scale, this.scale);
        //this.ctx.translate(-this.originx, -this.originy);

        console.log("RESIZE!");
    }

    render() {
        // save and apply canvas transforms
        this.ctx.save()
        this.ctx.scale(this.scale, this.scale); // scale first
        this.ctx.translate(-this.originx, -this.originy) // then translate

        // Use the identity matrix while clearing the canvas
        // TODO: verify that this is ONLY clearing the screen
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