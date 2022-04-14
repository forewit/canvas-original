import { Entity } from "./entity.js";
import { Board } from "./board.js";
import { generate_ID } from "../modules/utils.js";

export class Layer {
    readonly ID: string = generate_ID();

    private entities: { [id: string]: Entity } = {};

    add(...entities: Entity[]): void {
        for (let e of entities) this.entities[e.ID] = e;
    }

    destroy(...entities: Entity[]): void {
        // remove all entities if no entities are specified
        if (entities.length === 0) {
            for (let ID in this.entities) this.entities[ID].destroy();
            this.entities = {};
            return;
        }

        // remove specified entities
        for (let e of entities) {
            e.destroy();
            delete this.entities[e.ID];
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

    render(board: Board): void {
        for (let ID in this.entities) this.entities[ID].render(board);
    }
}