import { generate_ID } from "../modules/utils.js";
export class Layer {
    constructor() {
        this.ID = generate_ID();
        this.entities = {};
    }
    add(...entities) {
        for (let e of entities)
            this.entities[e.ID] = e;
    }
    destroy(...entities) {
        // remove all entities if no entities are specified
        if (entities.length === 0) {
            for (let ID in this.entities)
                this.entities[ID].destroy();
            this.entities = {};
            return;
        }
        // remove specified entities
        for (let e of entities) {
            e.destroy();
            delete this.entities[e.ID];
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
    render(board) {
        for (let ID in this.entities)
            this.entities[ID].render(board);
    }
}
