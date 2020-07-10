export class Layer {
    constructor (ID) {
        this.ID = ID;
        this.elm = document.createElement("canvas");
        this.opacity = 1;
        this.x_parallax = 0;
        this.y_parallax = 0;
        this.tokens = []; //sprites, particles, etc.
    }
    bringForward(token) {

    }
    sendBackward(token) {

    }
    addToken(token) {

    }
    removeToken(token) {

    }
    destroy() {

    }
    intersections(x, y) {

    }
}