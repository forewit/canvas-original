import { Entity } from "./entity.js";
import { Board } from "./board.js";

export class Layer {
    entities: Entity[];

    getIntersectingEntities(x: number, y: number): Entity[] { 
        return this.entities.filter(entity => entity.isIntersecting(x, y));
    }
    
    destroy(): void {
        this.entities.forEach(entity => entity.destroy());
        this.entities = [];
    }
    
    render(board: Board): void {
        this.entities.forEach(entity => entity.render(board));
    }
}