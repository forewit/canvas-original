export let elm = document.createElement("canvas");
export let gl = elm.getContext("2d");

if (!(gl instanceof CanvasRenderingContext2D)) alert("Canvas disabled");
document.body.appendChild(elm);

export class Layer {
    constructor (ID) {
        this.ID = ID;
        this.sprites = [];
        this.opacity = 1.0;
    }
}