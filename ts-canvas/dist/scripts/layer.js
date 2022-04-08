export class Layer {
    getIntersectingEntities(x, y) {
        return this.entities.filter(entity => entity.isIntersecting(x, y));
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
