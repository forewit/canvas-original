export class Entity {
    constructor() {
        this.ID = utils.generate_ID();

        // (x, y) is the entity's center point
        this._x = 0;
        this._y = 0;
        this._w = 0;
        this._h = 0;
        this._rotation = 0;
        this._halfw = 0;
        this._halfh = 0;

        // instances should set updatd to false when rendered
        this.updated = true;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get w() { return this._w; }
    get h() { return this._h; }
    get rotation() { return this._rotation; }
    get halfw() { return this._halfw; }
    get halfh() { return this._halfh; }

    set x(newx) { this._x = newx; this.updated = true; }
    set y(newy) { this._y = newy; this.updated = true; }
    set w(neww) { 
        this._w = neww; 
        this._halfw = neww / 2;
        this.updated = true;
    }
    set h(newh) { 
        this._h = newh; 
        this._halfh = newh / 2;
        this.updated = true; 
    }
    set rotation(newRotation) { this._rotation = newRotation % (Math.PI * 2); this.updated = true; }

    intersects(x, y) {
        let localPoint = utils.rotatePoint(this.x, this.y, x, y, this.rotation);
        return utils.pointInRectangle(localPoint.x, localPoint.y, this.x - this.halfw, this.y - this.halfh, this.w, this.h);
    }
    _render() { console.log("Please override entity.render()!") }
    _destroy() { /* should be overwritten */ }
}