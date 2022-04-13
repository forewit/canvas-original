import { generate_ID } from "../modules/utils.js";
export class Layer {
    constructor() {
        this.ID = generate_ID();
        this.entities = {};
    }
    add(...entities) {
        for (let e of entities) {
            // add entities to this layer
            this.entities[e.ID] = e;
            // set layerID for each entity
            e.layerID = this.ID;
        }
        for (let e of entities)
            e.layerID = this.ID;
    }
    remove(...entities) {
        for (let e of entities) {
            // remove entities from this layer
            delete this.entities[e.ID];
            // remove layerID from each entity
            e.layerID = null;
        }
    }
    getIntersectingEntities(x, y) {
        let intersectingEntities = [];
        for (let ID in this.entities) {
            let e = this.entities[ID];
            if (e.isIntersectingPoint(x, y))
                intersectingEntities.push(e);
        }
        return intersectingEntities;
    }
    duplicate() {
        // create new layer
        let layer = new Layer();
        // duplicate entities to the new layer
        for (let ID in this.entities)
            layer.add(this.entities[ID].duplicate());
        // return new layer
        return layer;
    }
    destroy() {
        for (let ID in this.entities)
            this.entities[ID].destroy();
    }
    render(board) {
        for (let ID in this.entities)
            this.entities[ID].render(board);
    }
}
