import { Point } from "./types.js";
import { Entity } from "./entity.js";

export class Layer {
    entities: Entity[] = [];

    bringForward(entity: Entity): void {}
    sendBackward(entity: Entity): void {}
    addEntity(entity: Entity): void {}
    destroyEntity(entity: Entity): void {}
    getFirstIntersection(point: Point): Entity | null { return null; }
    render(): void {}
    destroy(): void {}
}