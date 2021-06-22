export class Layer {
    constructor () {
        this.ID = utils.generate_ID();
        //this.opacity = 1;
        //this.x_parallax = 0;
        //this.y_parallax = 0;
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
        for (var i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i].ID == entity.ID) return;
        }
        this.entities.push(entity);
    }

    removeEntity(entity) {
        for (var i = 0, len = this.entities.length; i < len; i++) {
            if (this.entities[i].ID == entity.ID) {
                this.entities.splice(i, 1);
                return;
            }
        }
        return false;
    }
    
    destroy() { this.entities.length = 0; }
    
    getFirstIntersection(x, y) {
        for (var i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i].intersects(x, y)) return this.entities[i];
        }
        return undefined;
    }
    
    render(ctx) {
        this.entities.forEach(entity => entity.render(ctx));
    }
}