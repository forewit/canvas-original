import * as utils from "./utils.js";

export class Layer {
    constructor () {
        this.ID = utils.generate_ID();
        this.opacity = 1;
        this.x_parallax = 0;
        this.y_parallax = 0;
        this.entities = []; //sprites, particles, etc.
    }
    bringForward(entity) {
        for (var i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i].ID == entity.ID) {
                this.entities.splice(i, 1);
                this.entities.push(entity);
                return true;
            }
        }
        return false;
    }
    sendBackward(entity) {
        for (var i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i].ID == entity.ID) {
                this.entities.splice(i, 1);
                this.entities.unshift(entity);
                return true;
            }
        }
        return false;
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    destroyEntity(entity) {
        for (var i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i].ID == entity.ID) {
                this.entities[i].destroy();
                this.entities.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    destroy() {
        for (var i = 0, len = this.entities.length; i < len; i++) {
            this.entities[i].destroy();
        }
        this.entities.length = 0;
    }
    intersections(x, y) {

    }
    render(ctx) {
        for (var i = 0, len = this.entities.length; i < len; i++) {
            this.entities[i].render(ctx);
        }
    }
}