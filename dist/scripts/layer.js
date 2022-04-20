import { generate_ID } from "../modules/utils.js";
export class Layer {
    constructor() {
        this.ID = generate_ID();
        this.entities = [];
    }
    add(...entities) {
        for (let entity of entities) {
            // check for duplicates
            if (this.entities.findIndex(e => e.ID === entity.ID) > -1) {
                console.warn(`Entity with ID ${entity.ID} already exists in layer ${this.ID}.`);
                continue;
            }
            this.entities.push(entity);
        }
    }
    destroy(...entities) {
        // remove all entities if none are specified
        if (entities.length === 0) {
            for (let e of this.entities)
                e.destroy();
            this.entities = [];
            return;
        }
        // remove specified entities
        for (let entity of entities) {
            let index = this.entities.findIndex(e => e.ID === entity.ID);
            if (index != -1)
                this.entities.splice(index, 1);
        }
    }
    firstIntersection(x, y) {
        for (let e of this.entities) {
            if (e.isIntersectingPoint(x, y))
                return e;
        }
        return null;
    }
    duplicate() {
        // create new layer
        let layer = new Layer();
        // duplicate entities to the new layer
        for (let e of this.entities)
            layer.add(e.duplicate());
        // return new layer
        return layer;
    }
    render(board) {
        for (let e of this.entities)
            e.render(board);
    }
}
