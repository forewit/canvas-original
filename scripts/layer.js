import * as utils from "./utils.js";

export class Layer {
    constructor () {
        this.ID = utils.generate_ID();
        this.opacity = 1;
        this.x_parallax = 0;
        this.y_parallax = 0;
        this._tokens = []; //sprites, particles, etc.
    }
    bringForward(token) {
        for (var i = 0, len = this._tokens.length; i < len; i++) {
            if (this._tokens[i].ID == token.ID) {
                this._tokens.splice(i, 1);
                this._tokens.push(token);
                return true;
            }
        }
        return false;
    }
    sendBackward(token) {
        for (var i = 0, len = this._tokens.length; i < len; i++) {
            if (this._tokens[i].ID == token.ID) {
                this._tokens.splice(i, 1);
                this._tokens.unshift(token);
                return true;
            }
        }
        return false;
    }
    addToken(token) {
        this._tokens.push(token);
    }
    destroyToken(token) {
        for (var i = 0, len = this._tokens.length; i < len; i++) {
            if (this._tokens[i].ID == token.ID) {
                this._tokens[i].destroy();
                this._tokens.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    destroy() {
        for (var i = 0, len = this._tokens.length; i < len; i++) {
            this._tokens[i].destroy();
        }
        this._tokens.length = 0;
    }
    intersections(x, y) {

    }
    render(ctx) {
        for (var i = 0, len = this._tokens.length; i < len; i++) {
            this._tokens[i].render(ctx);
        }
    }
}