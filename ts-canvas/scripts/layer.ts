import { Entity } from "./entity.js";
import { Board } from "./board.js";

export class Layer {
    entities: Entity[] = [];

    private _board: Board;

    get board(): Board { return this._board; }
    set board(board: Board) {
        // check if layer is already in this board
        if (this.board === board) return;

        // remove layer from old board
        if (this.board) this.board.layers.splice(this.board.layers.indexOf(this), 1);

        // add layer to new board
        if (board) board.layers.push(this);
        this._board = board;
    }

    getIntersectingEntities(x: number, y: number): Entity[] {
        return this.entities.filter(entity => entity.isIntersectingPoint(x, y));
    }

    duplicate(): Layer {
        // create new layer
        let layer = new Layer();

        // duplicate entities and set their layer to the new layer
        for (let entity of this.entities) {
            entity.duplicate().layer = layer;
        }

        // return new layer
        return layer;
    }

    destroy(): void {
        for (let entity of this.entities) entity.destroy();
        this.board = null;    
    }

    render(board: Board): void {
        for (let entity of this.entities) entity.render(board);
    }
}