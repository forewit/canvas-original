import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { generate_ID } from "../modules/utils.js";

export class Layer {
    readonly ID: string = generate_ID();
    entities: { [id: string]: Entity } = {};

    add(...entities: Entity[]): void {
        for (let e of entities) {
            // add entities to this layer
            this.entities[e.ID] = e;

            // set layerID for each entity
            e.layerID = this.ID;
        }

        for (let e of entities) e.layerID = this.ID;
    }

    remove(...entities: Entity[]): void {
        for (let e of entities) {
            // remove entities from this layer
            delete this.entities[e.ID];

            // remove layerID from each entity
            e.layerID = null;
        }
    }

    getIntersectingEntities(x: number, y: number): Entity[] {
        let intersectingEntities: Entity[] = [];

        for (let ID in this.entities) {
            let e = this.entities[ID];
            if (e.isIntersectingPoint(x, y)) intersectingEntities.push(e);
        }

        return intersectingEntities;
    }

    duplicate(): Layer {
        // create new layer
        let layer = new Layer();

        // duplicate entities to the new layer
        for (let ID in this.entities) layer.add(this.entities[ID].duplicate());

        // return new layer
        return layer;
    }

    destroy(): void {
        for (let ID in this.entities) this.entities[ID].destroy();
    }

    render(board: Board): void {
        for (let ID in this.entities) this.entities[ID].render(board);
    }
}