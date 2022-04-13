export class Layer {
    constructor() {
        this.entities = [];
    }
    get board() { return this._board; }
    set board(board) {
        // check if layer is already in this board
        if (this.board === board)
            return;
        // remove layer from old board
        if (this.board)
            this.board.layers.splice(this.board.layers.indexOf(this), 1);
        // add layer to new board
        if (board)
            board.layers.push(this);
        this._board = board;
    }
    getIntersectingEntities(x, y) {
        return this.entities.filter(entity => entity.isIntersectingPoint(x, y));
    }
    duplicate() {
        // create new layer
        let layer = new Layer();
        // duplicate entities and set their layer to the new layer
        for (let entity of this.entities) {
            entity.duplicate().layer = layer;
        }
        // return new layer
        return layer;
    }
    destroy() {
        for (let entity of this.entities)
            entity.destroy();
        this.board = null;
    }
    render(board) {
        for (let entity of this.entities)
            entity.render(board);
    }
}
