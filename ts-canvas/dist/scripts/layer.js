export class Layer {
    constructor() {
        this.entities = [];
    }
    getIntersectingEntities(x, y) {
        return this.entities.filter(entity => entity.isIntersectingPoint(x, y));
    }
    duplicate() {
        let layer = new Layer();
        layer.entities = this.entities.map(entity => entity.duplicate());
        return layer;
    }
    destroy() {
        this.entities.forEach(entity => entity.destroy());
        this.entities = [];
    }
    render(board) {
        this.entities.forEach(entity => entity.render(board));
    }
}
